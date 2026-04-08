import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor — no registration needed
        return await createActorWithConfig();
      }

      // Pass only agentOptions (with identity). The local createActorWithConfig
      // builds the agent from agentOptions and then explicitly OMITS agentOptions
      // when calling createActor(), preventing the double-pass warning.
      const actor = await createActorWithConfig({
        agentOptions: { identity },
      });

      // Register the caller with the backend.
      // Wrapped in try/catch — this call can fail transiently
      // (cold canister, already-registered user, network blip). A failure
      // here must NOT prevent the actor from being returned.
      try {
        const adminToken = getSecretParameter("caffeineAdminToken") ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (actor as any)._initializeAccessControlWithSecret(adminToken);
        console.log(
          "[useActor] Actor ready for principal:",
          identity.getPrincipal().toString(),
        );
      } catch (err) {
        console.warn(
          "[useActor] _initializeAccessControlWithSecret failed (non-fatal, actor still usable):",
          err,
        );
      }

      return actor;
    },
    // Keep actor cached forever — only recreate when the identity changes.
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: true,
    // Never retry the actor query itself — failures are handled per-query.
    retry: false,
  });

  // When the actor becomes available, mark all other queries as stale so they
  // re-fetch on their next observation. We intentionally do NOT call
  // refetchQueries here to avoid a reconnect storm before auth has settled.
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data ?? null,
    isFetching: actorQuery.isFetching,
  };
}
