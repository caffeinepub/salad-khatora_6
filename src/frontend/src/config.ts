import { createActorWithConfig as _createActorWithConfig } from "@caffeineai/core-infrastructure";
import {
  createActor as _createActor,
  type backendInterface,
  type CreateActorOptions,
  type ExternalBlob,
} from "./backend";

/**
 * A wrapper around the generated createActor that ensures agentOptions is
 * NOT forwarded when a pre-built agent is already provided. This prevents
 * the "Detected both agent and agentOptions passed to createActor" warning.
 */
function createActorFixed(
  canisterId: string,
  uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions,
): backendInterface {
  // When a pre-built agent is already present, strip agentOptions to avoid
  // the double-pass warning from backend.ts createActor().
  if (options.agent) {
    const { agentOptions: _stripped, ...safeOptions } = options;
    return _createActor(canisterId, uploadFile, downloadFile, safeOptions);
  }
  return _createActor(canisterId, uploadFile, downloadFile, options);
}

export async function createActorWithConfig(
  options?: CreateActorOptions,
): Promise<backendInterface> {
  return _createActorWithConfig(createActorFixed, options);
}
