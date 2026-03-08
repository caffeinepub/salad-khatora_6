const FREQ_KEY = "sk_order_frequency";

/**
 * Record order frequency for a list of ordered items.
 * Adds to existing counts (does not replace).
 */
export function recordOrderFrequency(
  items: Array<{ menuItemId: bigint; quantity: bigint | number }>,
): void {
  const existing = getOrderFrequency();
  for (const item of items) {
    const key = item.menuItemId.toString();
    const qty = Number(item.quantity) || 1;
    existing[key] = (existing[key] ?? 0) + qty;
  }
  try {
    localStorage.setItem(FREQ_KEY, JSON.stringify(existing));
  } catch {
    // Silently ignore storage errors (private mode, quota exceeded, etc.)
  }
}

/**
 * Returns a map of { "menuItemId": totalOrderCount, ... }
 */
export function getOrderFrequency(): Record<string, number> {
  try {
    const raw = localStorage.getItem(FREQ_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}
