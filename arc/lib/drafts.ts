// src/lib/drafts.ts

const KEY = "planner_prefill";

/**
 * Save a draft from Chat → Planner
 */
export function saveTripDraft(payload: {
  tab: "Flights" | "Itinerary";
  data: any;
}) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      ...payload,
      ts: Date.now(),
    })
  );
}

/**
 * Load draft inside Planner
 */
export function loadTripDraft():
  | { tab: "Flights" | "Itinerary"; data: any }
  | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      tab: parsed.tab,
      data: parsed.data,
    };
  } catch {
    return null;
  }
}

/**
 * Clear after applying
 */
export function clearTripDraft() {
  sessionStorage.removeItem(KEY);
}