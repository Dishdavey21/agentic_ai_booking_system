import { useMemo, useState } from "react";
import "../App.css";

/* ---------------- TYPES ---------------- */

type SearchInput = { from: string; to: string; date: string };

type FlightOption = {
  id: string;
  carrier: string;
  price: number; // mock INR
  duration: number; // minutes
  stops: number;
  type: "BUDGET" | "PREMIUM";
};

type ScoreBreakdown = {
  wPrice: number;
  wDuration: number;
  stopPenalty: number;
  priceComponent: number;
  durationComponent: number;
  stopsComponent: number;
  totalScore: number;
  formula: string;
};

type ScoredFlight = FlightOption & { score: number; breakdown: ScoreBreakdown };

type TripInput = {
  city: string;
  days: number;
  budgetStyle: "Shoestring" | "Value" | "Comfort";
  interests: string[];
};

type POI = {
  id: string;
  city: string;
  name: string;
  tags: string[];
  estCost: "Free" | "Low" | "Medium";
  bestTime: "Morning" | "Afternoon" | "Evening";
  durationHrs: number;
};

type DayPlan = {
  day: number;
  theme: string;
  blocks: { time: string; activity: string; cost: string; note?: string }[];
};

type ItineraryResult = {
  itinerary: DayPlan[];
  reasoning: string[];
  constraints: { budgetStyle: string; maxPaidPerDay: number };
};

/* ---------------- MOCK DATA ---------------- */

const POIS: POI[] = [
  { id: "m1", city: "Mumbai", name: "Marine Drive walk", tags: ["Nature", "Romance", "Photography"], estCost: "Free", bestTime: "Evening", durationHrs: 2 },
  { id: "m2", city: "Mumbai", name: "Gateway of India", tags: ["History", "Photography"], estCost: "Free", bestTime: "Morning", durationHrs: 1.5 },
  { id: "m3", city: "Mumbai", name: "Colaba street food crawl", tags: ["Food", "Local"], estCost: "Low", bestTime: "Evening", durationHrs: 2 },
  { id: "m4", city: "Mumbai", name: "CSMT (architecture + photos)", tags: ["History", "Architecture", "Photography"], estCost: "Free", bestTime: "Afternoon", durationHrs: 1.5 },
  { id: "m5", city: "Mumbai", name: "Sanjay Gandhi National Park", tags: ["Nature", "Adventure"], estCost: "Low", bestTime: "Morning", durationHrs: 3 },

  { id: "c1", city: "Chennai", name: "Marina Beach sunrise", tags: ["Nature", "Photography"], estCost: "Free", bestTime: "Morning", durationHrs: 2 },
  { id: "c2", city: "Chennai", name: "Mylapore heritage walk", tags: ["History", "Culture"], estCost: "Free", bestTime: "Morning", durationHrs: 2.5 },
  { id: "c3", city: "Chennai", name: "Filter coffee + tiffin trail", tags: ["Food", "Local"], estCost: "Low", bestTime: "Afternoon", durationHrs: 2 },
  { id: "c4", city: "Chennai", name: "Kapaleeshwarar Temple visit", tags: ["Culture", "History"], estCost: "Free", bestTime: "Evening", durationHrs: 1.5 },

  { id: "b1", city: "Bengaluru", name: "Cubbon Park stroll", tags: ["Nature", "Photography"], estCost: "Free", bestTime: "Morning", durationHrs: 2 },
  { id: "b2", city: "Bengaluru", name: "Church Street café hop", tags: ["Food", "Local"], estCost: "Low", bestTime: "Evening", durationHrs: 2.5 },
  { id: "b3", city: "Bengaluru", name: "Bangalore Palace (outside + photos)", tags: ["History", "Architecture", "Photography"], estCost: "Low", bestTime: "Afternoon", durationHrs: 2 },

  { id: "d1", city: "Delhi", name: "India Gate + lawns", tags: ["History", "Photography"], estCost: "Free", bestTime: "Evening", durationHrs: 2 },
  { id: "d2", city: "Delhi", name: "Old Delhi food walk (budget)", tags: ["Food", "Local"], estCost: "Low", bestTime: "Afternoon", durationHrs: 3 },
  { id: "d3", city: "Delhi", name: "Humayun’s Tomb area", tags: ["History", "Photography"], estCost: "Medium", bestTime: "Morning", durationHrs: 3 },

  { id: "g1", city: "Goa", name: "Beach day (sunset + swim)", tags: ["Nature", "Adventure", "Photography"], estCost: "Free", bestTime: "Evening", durationHrs: 4 },
  { id: "g2", city: "Goa", name: "Local market browsing", tags: ["Local", "Shopping"], estCost: "Free", bestTime: "Afternoon", durationHrs: 2 },
  { id: "g3", city: "Goa", name: "Budget seafood lunch", tags: ["Food"], estCost: "Low", bestTime: "Afternoon", durationHrs: 1.5 },
];

const CITY_LIST = ["Mumbai", "Chennai", "Bengaluru", "Delhi", "Goa"];

/* ---------------- FLIGHT WORKERS (MOCK) ---------------- */

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

function flightOrchestrator(input: SearchInput): { results: ScoredFlight[]; trace: string[] } {
  const trace: string[] = [];
  trace.push(`Orchestrator received goal: find best flight from ${input.from} → ${input.to} on ${input.date || "(date not set)"}.`);
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

/* ---------------- ITINERARY AGENTS ---------------- */

function interestsAgent(input: TripInput): { tags: string[]; trace: string } {
  const tags = input.interests.length ? input.interests : ["Local", "Food", "Photography"];
  return { tags, trace: `InterestsAgent set target tags = ${tags.join(", ")}.` };
}

function budgetPolicyAgent(input: TripInput): { maxPaidPerDay: number; trace: string } {
  const maxPaidPerDay = input.budgetStyle === "Shoestring" ? 1 : input.budgetStyle === "Value" ? 2 : 3;
  return { maxPaidPerDay, trace: `BudgetPolicyAgent set maxPaidPerDay=${maxPaidPerDay} based on budgetStyle=${input.budgetStyle}.` };
}

function poiSelectorAgent(city: string, targetTags: string[]): { selected: POI[]; trace: string } {
  const pool = POIS.filter((p) => p.city === city);
  const scored = pool
    .map((p) => ({ p, s: p.tags.filter((t) => targetTags.includes(t)).length }))
    .sort((a, b) => b.s - a.s);

  const selected = scored.map((x) => x.p);
  return { selected, trace: `POISelectorAgent found ${pool.length} POIs in ${city} and ranked by tag overlap.` };
}

function schedulerAgent(input: TripInput, pois: POI[], maxPaidPerDay: number): { itinerary: DayPlan[]; trace: string[] } {
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

function itineraryOrchestrator(input: TripInput): ItineraryResult {
  const reasoning: string[] = [];
  reasoning.push(`Orchestrator received goal: plan a ${input.days}-day trip to ${input.city} with budgetStyle=${input.budgetStyle}.`);
  reasoning.push("Delegating tasks to worker agents: InterestsAgent, BudgetPolicyAgent, POISelectorAgent, SchedulerAgent.");

  const interests = interestsAgent(input);
  reasoning.push(interests.trace);

  const budget = budgetPolicyAgent(input);
  reasoning.push(budget.trace);

  const pois = poiSelectorAgent(input.city, interests.tags);
  reasoning.push(pois.trace);

  const schedule = schedulerAgent(input, pois.selected, budget.maxPaidPerDay);
  reasoning.push(...schedule.trace);

  return { itinerary: schedule.itinerary, reasoning, constraints: { budgetStyle: input.budgetStyle, maxPaidPerDay: budget.maxPaidPerDay } };
}

/* ---------------- PAGE UI ---------------- */

type Tab = "Flights" | "Itinerary";

export default function Planner() {
  const [tab, setTab] = useState<Tab>("Itinerary");

  const [flightInput, setFlightInput] = useState<SearchInput>({ from: "", to: "", date: "" });
  const [flightResults, setFlightResults] = useState<ScoredFlight[]>([]);
  const [flightTrace, setFlightTrace] = useState<string[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ScoredFlight | null>(null);
  const [approved, setApproved] = useState(false);

  const [tripInput, setTripInput] = useState<TripInput>({
    city: "Mumbai",
    days: 3,
    budgetStyle: "Value",
    interests: ["Food", "History", "Photography"],
  });
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);

  const interestOptions = useMemo(
    () => ["Food", "History", "Nature", "Photography", "Adventure", "Culture", "Local", "Shopping"],
    []
  );

  const toggleInterest = (tag: string) => {
    setTripInput((prev) => {
      const exists = prev.interests.includes(tag);
      const interests = exists ? prev.interests.filter((t) => t !== tag) : [...prev.interests, tag];
      return { ...prev, interests };
    });
  };

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--accent)" }} />
          <div>Disha.travel Planner</div>
        </div>

        <div className="tabs">
          <button className={tab === "Itinerary" ? "tab tabActive" : "tab"} onClick={() => setTab("Itinerary")}>
            Itinerary
          </button>
          <button className={tab === "Flights" ? "tab tabActive" : "tab"} onClick={() => setTab("Flights")}>
            Flights
          </button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          {tab === "Flights" ? (
            <>
              <div className="cardHeader">
                <div>
                  <h2 className="title">Flight Trade-off Planner</h2>
                  <div className="subtitle">Ranks options using price, time, and stops with an explainable trace.</div>
                </div>
                <span className="pill">Approval gate</span>
              </div>

              <div className="formRow">
                <input className="input" placeholder="From (e.g., Chennai)" value={flightInput.from} onChange={(e) => setFlightInput({ ...flightInput, from: e.target.value })} />
                <input className="input" placeholder="To (e.g., Mumbai)" value={flightInput.to} onChange={(e) => setFlightInput({ ...flightInput, to: e.target.value })} />
                <input className="input" type="date" value={flightInput.date} onChange={(e) => setFlightInput({ ...flightInput, date: e.target.value })} />
              </div>

              <div className="kpiRow">
                <span className="kpi">BudgetAgent + PremiumAgent</span>
                <span className="kpi">Scoring + trace</span>
                <span className="kpi">Approval before redirect</span>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  className="btn"
                  onClick={() => {
                    setApproved(false);
                    setSelectedFlight(null);
                    const out = flightOrchestrator(flightInput);
                    setFlightResults(out.results);
                    setFlightTrace(out.trace);
                  }}
                >
                  Run Orchestrator
                </button>
                <button
                  className="btnGhost"
                  onClick={() => {
                    setFlightResults([]);
                    setFlightTrace([]);
                    setSelectedFlight(null);
                    setApproved(false);
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="cardHeader">
                <div>
                  <h2 className="title">AI Itinerary Generator</h2>
                  <div className="subtitle">Interests → POIs → schedule with constraints and full reasoning trace.</div>
                </div>
                <span className="pill">Explainable planning</span>
              </div>

              <div className="formRow" style={{ gridTemplateColumns: "1.2fr 0.8fr 1fr" }}>
                <select className="input" value={tripInput.city} onChange={(e) => setTripInput({ ...tripInput, city: e.target.value })}>
                  {CITY_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input className="input" type="number" min={1} max={7} value={tripInput.days} onChange={(e) => setTripInput({ ...tripInput, days: Number(e.target.value) })} />

                <select className="input" value={tripInput.budgetStyle} onChange={(e) => setTripInput({ ...tripInput, budgetStyle: e.target.value as TripInput["budgetStyle"] })}>
                  <option value="Shoestring">Shoestring</option>
                  <option value="Value">Value</option>
                  <option value="Comfort">Comfort</option>
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="small" style={{ marginBottom: 8 }}>Interests (select 2–5)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {interestOptions.map((tag) => {
                    const active = tripInput.interests.includes(tag);
                    return (
                      <button key={tag} className={active ? "tab tabActive" : "tab"} onClick={() => toggleInterest(tag)} type="button">
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button
                  className="btn btnOk"
                  onClick={() => {
                    const out = itineraryOrchestrator(tripInput);
                    setItinerary(out);
                  }}
                >
                  Generate Itinerary
                </button>
                <button className="btnGhost" onClick={() => setItinerary(null)}>Clear</button>
              </div>

              <div className="kpiRow">
                <span className="kpi">InterestsAgent</span>
                <span className="kpi">BudgetPolicyAgent</span>
                <span className="kpi">POISelectorAgent</span>
                <span className="kpi">SchedulerAgent</span>
              </div>
            </>
          )}
        </div>

        <div className="card">
          {tab === "Flights" ? (
            <>
              <div className="cardHeader">
                <div>
                  <h2 className="title">Ranked Options</h2>
                  <div className="subtitle">Select an option, review trace, then approve redirect.</div>
                </div>
              </div>

              {flightResults.length === 0 ? (
                <div className="small">Run the orchestrator to see results.</div>
              ) : (
                <div className="list">
                  {flightResults.map((r) => (
                    <div className="item" key={r.id}>
                      <div className="itemTop">
                        <div>
                          <div style={{ fontWeight: 900 }}>{r.carrier}</div>
                          <div className="small">₹{r.price} • {r.duration} min • Stops: {r.stops} • {r.type}</div>
                        </div>
                        <span className="pill">Score: {Math.round(r.score)}</span>
                      </div>

                      <details>
                        <summary>Reasoning Trace</summary>
                        <div className="small" style={{ marginTop: 8 }}>
                          <div><b>Formula:</b> {r.breakdown.formula}</div>
                          <div><b>Weights:</b> wPrice={r.breakdown.wPrice}, wDuration={r.breakdown.wDuration}, stopPenalty={r.breakdown.stopPenalty}</div>
                          <div className="hr" />
                          <div>Price: ₹{r.price} × {r.breakdown.wPrice} = <b>{Math.round(r.breakdown.priceComponent)}</b></div>
                          <div>Duration: {r.duration} × {r.breakdown.wDuration} = <b>{Math.round(r.breakdown.durationComponent)}</b></div>
                          <div>Stops: {r.stops} × {r.breakdown.stopPenalty} = <b>{Math.round(r.breakdown.stopsComponent)}</b></div>
                          <div className="hr" />
                          <div><b>Total:</b> {Math.round(r.breakdown.totalScore)}</div>
                        </div>
                      </details>

                      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                        <button className="btnGhost" onClick={() => setSelectedFlight(r)}>Select</button>
                        {selectedFlight?.id === r.id && !approved && (
                          <button className="btn btnOk" onClick={() => setApproved(true)}>Approve Redirect</button>
                        )}
                        {selectedFlight?.id === r.id && approved && (
                          <a className="btn" href="https://www.skyscanner.co.in" target="_blank" rel="noreferrer">
                            Continue to Provider
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {flightTrace.length > 0 && (
                <details style={{ marginTop: 12 }}>
                  <summary>Orchestrator Execution Trace</summary>
                  <div className="small" style={{ marginTop: 8 }}>
                    {flightTrace.map((t, i) => (
                      <div key={i} style={{ marginBottom: 6 }}>{i + 1}. {t}</div>
                    ))}
                  </div>
                </details>
              )}
            </>
          ) : (
            <>
              <div className="cardHeader">
                <div>
                  <h2 className="title">Generated Plan</h2>
                  <div className="subtitle">Day-wise itinerary with constraints and full reasoning trace.</div>
                </div>
              </div>

              {!itinerary ? (
                <div className="small">Choose inputs and click <b>Generate Itinerary</b>.</div>
              ) : (
                <>
                  <div className="kpiRow">
                    <span className="kpi">City: {tripInput.city}</span>
                    <span className="kpi">Days: {Math.max(1, Math.min(7, tripInput.days))}</span>
                    <span className="kpi">Budget: {itinerary.constraints.budgetStyle}</span>
                    <span className="kpi">Max “Medium”/day: {itinerary.constraints.maxPaidPerDay}</span>
                  </div>

                  {itinerary.itinerary.map((d) => (
                    <div className="day" key={d.day}>
                      <div className="dayTitle">Day {d.day} • {d.theme}</div>
                      <div className="small">
                        {d.blocks.map((b, i) => (
                          <div key={i} style={{ marginTop: 6 }}>
                            <b>{b.time}:</b> {b.activity} <span className="pill">{b.cost}</span>
                            {b.note ? <div className="small" style={{ marginTop: 2 }}>{b.note}</div> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <details style={{ marginTop: 12 }}>
                    <summary>Agent Reasoning Trace</summary>
                    <div className="small" style={{ marginTop: 8 }}>
                      {itinerary.reasoning.map((t, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>{i + 1}. {t}</div>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}