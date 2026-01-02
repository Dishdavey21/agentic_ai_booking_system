// src/lib/drafts.ts

export type PlannerTab = "Flights" | "Itinerary";

export type PlannerDraft =
  | { tab: "Flights"; data: { from: string; to: string; date: string } }
  | { tab: "Itinerary"; data: { city: string; days: number; budgetStyle: "Shoestring" | "Value" | "Comfort"; interests: string[] } };

const KEY = "planner_prefill";

export function saveTripDraft(draft: PlannerDraft) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      ...draft,
      ts: Date.now(),
    })
  );
}

export function loadTripDraft(): PlannerDraft | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PlannerDraft & { ts?: number };
    // minimal validation
    if (!parsed || (parsed.tab !== "Flights" && parsed.tab !== "Itinerary")) return null;
    return { tab: parsed.tab, data: parsed.data } as PlannerDraft;
  } catch {
    return null;
  }
}

export function clearTripDraft() {
  sessionStorage.removeItem(KEY);
}