/* =========================
   AGENTIC CORE 
========================= */

/* ---------- TYPES ---------- */

export type SearchInput = { from: string; to: string; date: string };

export type FlightOption = {
  id: string;
  carrier: string;
  price: number; // mock INR
  duration: number; // minutes
  stops: number;
  type: "BUDGET" | "PREMIUM";
};

export type ScoreBreakdown = {
  wPrice: number;
  wDuration: number;
  stopPenalty: number;
  priceComponent: number;
  durationComponent: number;
  stopsComponent: number;
  totalScore: number;
  formula: string;
};

export type ScoredFlight = FlightOption & {
  score: number;
  breakdown: ScoreBreakdown;
};

export type TripInput = {
  city: string;
  days: number;
  budgetStyle: "Shoestring" | "Value" | "Comfort";
  interests: string[];
};

export type POI = {
  id: string;
  city: string;
  name: string;
  tags: string[];
  estCost: "Free" | "Low" | "Medium";
  bestTime: "Morning" | "Afternoon" | "Evening";
  durationHrs: number;
};

export type DayPlan = {
  day: number;
  theme: string;
  blocks: { time: string; activity: string; cost: string; note?: string }[];
};

export type ItineraryResult = {
  itinerary: DayPlan[];
  reasoning: string[];
  constraints: { budgetStyle: string; maxPaidPerDay: number };
};

/* ---------- CONSTANTS (exported for UI) ---------- */

export const CITY_LIST = ["Mumbai", "Chennai", "Bengaluru", "Delhi", "Goa"] as const;

export const INTEREST_OPTIONS = [
  "Food",
  "History",
  "Nature",
  "Photography",
  "Adventure",
  "Culture",
  "Local",
  "Shopping",
] as const;

/* ---------- MOCK DATA ---------- */

const POIS: POI[] = [
  // Mumbai
  { id: "m1", city: "Mumbai", name: "Marine Drive walk", tags: ["Nature", "Romance", "Photography"], estCost: "Free", bestTime: "Evening", durationHrs: 2 },
  { id: "m2", city: "Mumbai", name: "Gateway of India", tags: ["History", "Photography"], estCost: "Free", bestTime: "Morning", durationHrs: 1.5 },
  { id: "m3", city: "Mumbai", name: "Colaba street food crawl", tags: ["Food", "Local"], estCost: "Low", bestTime: "Evening", durationHrs: 2 },
  { id: "m4", city: "Mumbai", name: "CSMT (architecture + photos)", tags: ["History", "Architecture", "Photography"], estCost: "Free", bestTime: "Afternoon", durationHrs: 1.5 },
  { id: "m5", city: "Mumbai", name: "Sanjay Gandhi National Park", tags: ["Nature", "Adventure"], estCost: "Low", bestTime: "Morning", durationHrs: 3 },

  // Chennai
  { id: "c1", city: "Chennai", name: "Marina Beach sunrise", tags: ["Nature", "Photography"], estCost: "Free", bestTime: "Morning", durationHrs: 2 },
  { id: "c2", city: "Chennai", name: "Mylapore heritage walk", tags: ["History", "Culture"], estCost: "Free", bestTime: "Morning", durationHrs: 2.5 },
  { id: "c3", city: "Chennai", name: "Filter coffee + tiffin trail", tags: ["Food", "Local"], estCost: "Low", bestTime: "Afternoon", durationHrs: 2 },
  { id: "c4", city: "Chennai", name: "Kapaleeshwarar Temple visit", tags: ["Culture", "History"], estCost: "Free", bestTime: "Evening", durationHrs: 1.5 },

  // Bengaluru
  { id: "b1", city: "Bengaluru", name: "Cubbon Park stroll", tags: ["Nature", "Photography"], estCost: "Free", bestTime: "Morning", durationHrs: 2 },
  { id: "b2", city: "Bengaluru", name: "Church Street café hop", tags: ["Food", "Local"], estCost: "Low", bestTime: "Evening", durationHrs: 2.5 },
  { id: "b3", city: "Bengaluru", name: "Bangalore Palace (outside + photos)", tags: ["History", "Architecture", "Photography"], estCost: "Low", bestTime: "Afternoon", durationHrs: 2 },

  // Delhi
  { id: "d1", city: "Delhi", name: "India Gate + lawns", tags: ["History", "Photography"], estCost: "Free", bestTime: "Evening", durationHrs: 2 },
  { id: "d2", city: "Delhi", name: "Old Delhi food walk (budget)", tags: ["Food", "Local"], estCost: "Low", bestTime: "Afternoon", durationHrs: 3 },
  { id: "d3", city: "Delhi", name: "Humayun’s Tomb area", tags: ["History", "Photography"], estCost: "Medium", bestTime: "Morning", durationHrs: 3 },

  // Goa
  { id: "g1", city: "Goa", name: "Beach day (sunset + swim)", tags: ["Nature", "Adventure", "Photography"], estCost: "Free", bestTime: "Evening", durationHrs: 4 },
  { id: "g2", city: "Goa", name: "Local market browsing", tags: ["Local", "Shopping"], estCost: "Free", bestTime: "Afternoon", durationHrs: 2 },
  { id: "g3", city: "Goa", name: "Budget seafood lunch", tags: ["Food"], estCost: "Low", bestTime: "Afternoon", durationHrs: 1.5 },
];

/* ---------- FLIGHT WORKERS ---------- */

function budgetAgent(_input: SearchInput): FlightOption[] {
  return [
    { id: "B1", carrier: "BudgetAir", price: 42000, duration: 780, stops: 1, type: "BUDGET" },
    { id: "B2", carrier: "CheapFly", price: 39000, duration: 900, stops: 2, type: "BUDGET" },
  ];
}

function premiumAgent(_input: SearchInput): FlightOption[] {
  return [
    { id: "P1", carrier: "Premium Airlines", price: 78000, duration: 540, stops: 0, type: "PREMIUM" },
    { id: "P2", carrier: "Global Air", price: 72000, duration: 600, stops: 1, type: "PREMIUM" },
  ];
}

function scoreWithBreakdown(
  f: FlightOption,
  weights = { wPrice: 0.5, wDuration: 0.3, stopPenalty: 10000 }
): ScoreBreakdown {
  const priceComponent = f.price * weights.wPrice;
  const durationComponent = f.duration * weights.wDuration;
  const stopsComponent = f.stops * weights.stopPenalty;
  const totalScore = priceComponent + durationComponent + stopsComponent;

  return {
    wPrice: weights.wPrice,
    wDuration: weights.wDuration,
    stopPenalty: weights.stopPenalty,
    priceComponent,
    durationComponent,
    stopsComponent,
    totalScore,
    formula: "score = (price×wPrice) + (duration×wDuration) + (stops×stopPenalty)",
  };
}

export function flightOrchestrator(input: SearchInput): { results: ScoredFlight[]; trace: string[] } {
  const trace: string[] = [];
  trace.push(
    `Orchestrator received goal: find best flight from ${input.from} → ${input.to} on ${input.date || "(date not set)"}.`
  );
  trace.push("Delegating to Worker Agents: BudgetAgent and PremiumAgent.");

  const budget = budgetAgent(input);
  trace.push(`BudgetAgent returned ${budget.length} options.`);

  const premium = premiumAgent(input);
  trace.push(`PremiumAgent returned ${premium.length} options.`);

  trace.push("AnalystAgent scoring each option using weighted utility function (price, duration, stops).");

  const combined: ScoredFlight[] = [...budget, ...premium]
    .map((f) => {
      const breakdown = scoreWithBreakdown(f);
      return { ...f, score: breakdown.totalScore, breakdown };
    })
    .sort((a, b) => a.score - b.score);

  trace.push(`Final ranking produced. Best option = ${combined[0]?.id ?? "N/A"} (lowest score).`);
  return { results: combined, trace };
}

/* ---------- ITINERARY AGENTS ---------- */

function interestsAgent(input: TripInput): { tags: string[]; trace: string } {
  const tags = input.interests.length ? input.interests : ["Local", "Food", "Photography"];
  return { tags, trace: `InterestsAgent set target tags = ${tags.join(", ")}.` };
}

function budgetPolicyAgent(input: TripInput): { maxPaidPerDay: number; trace: string } {
  const maxPaidPerDay = input.budgetStyle === "Shoestring" ? 1 : input.budgetStyle === "Value" ? 2 : 3;
  return {
    maxPaidPerDay,
    trace: `BudgetPolicyAgent set maxPaidPerDay=${maxPaidPerDay} based on budgetStyle=${input.budgetStyle}.`,
  };
}

function poiSelectorAgent(city: string, targetTags: string[]): { selected: POI[]; trace: string } {
  const pool = POIS.filter((p) => p.city === city);
  const scored = pool
    .map((p) => ({ p, s: p.tags.filter((t) => targetTags.includes(t)).length }))
    .sort((a, b) => b.s - a.s);

  const selected = scored.map((x) => x.p);
  return { selected, trace: `POISelectorAgent found ${pool.length} POIs in ${city} and ranked by tag overlap.` };
}

function schedulerAgent(
  input: TripInput,
  pois: POI[],
  maxPaidPerDay: number
): { itinerary: DayPlan[]; trace: string[] } {
  const trace: string[] = [];
  const days = Math.max(1, Math.min(7, input.days));
  trace.push(`SchedulerAgent creating ${days}-day itinerary with time blocks.`);

  const byTime = (t: POI["bestTime"]) => pois.filter((p) => p.bestTime === t);
  const morning = byTime("Morning");
  const afternoon = byTime("Afternoon");
  const evening = byTime("Evening");

  const pick = (arr: POI[], used: Set<string>) => {
    const next = arr.find((p) => !used.has(p.id));
    return next ?? null;
  };

  const used = new Set<string>();
  const itinerary: DayPlan[] = [];

  for (let d = 1; d <= days; d++) {
    let paidCount = 0;
    const m = pick(morning, used);
    const a = pick(afternoon, used);
    const e = pick(evening, used);

    const blocks: DayPlan["blocks"] = [];

    const add = (time: string, poi: POI | null) => {
      if (!poi) {
        blocks.push({ time, activity: "Flexible time / Rest / Explore nearby", cost: "—", note: "Buffer block" });
        return;
      }

      const isPaid = poi.estCost === "Medium";
      if (isPaid && paidCount >= maxPaidPerDay) {
        blocks.push({
          time,
          activity: "Free alternative: local walk + photo spots + markets",
          cost: "Free",
          note: "BudgetPolicy applied (skipped medium-cost activity)",
        });
        return;
      }

      if (isPaid) paidCount += 1;
      used.add(poi.id);

      blocks.push({
        time,
        activity: poi.name,
        cost: poi.estCost,
        note: `Best time: ${poi.bestTime}, Duration ~${poi.durationHrs}h`,
      });
    };

    add("Morning", m);
    add("Afternoon", a);
    add("Evening", e);

    itinerary.push({
      day: d,
      theme: d === 1 ? "Orientation + highlights" : d === days ? "Relax + wrap-up" : "Explore deeper",
      blocks,
    });
  }

  trace.push("SchedulerAgent ensured Morning/Afternoon/Evening structure with buffer blocks.");
  trace.push("Budget policy enforced on medium-cost activities.");
  return { itinerary, trace };
}

export function itineraryOrchestrator(input: TripInput): ItineraryResult {
  const reasoning: string[] = [];
  reasoning.push(
    `Orchestrator received goal: plan a ${input.days}-day trip to ${input.city} with budgetStyle=${input.budgetStyle}.`
  );
  reasoning.push("Delegating tasks to worker agents: InterestsAgent, BudgetPolicyAgent, POISelectorAgent, SchedulerAgent.");

  const interests = interestsAgent(input);
  reasoning.push(interests.trace);

  const budget = budgetPolicyAgent(input);
  reasoning.push(budget.trace);

  const pois = poiSelectorAgent(input.city, interests.tags);
  reasoning.push(pois.trace);

  const schedule = schedulerAgent(input, pois.selected, budget.maxPaidPerDay);
  reasoning.push(...schedule.trace);

  return {
    itinerary: schedule.itinerary,
    reasoning,
    constraints: { budgetStyle: input.budgetStyle, maxPaidPerDay: budget.maxPaidPerDay },
  };
}