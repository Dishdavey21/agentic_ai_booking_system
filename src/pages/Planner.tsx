import { useMemo, useState } from "react";
import "../App.css";
import {
  CITY_LIST,
  INTEREST_OPTIONS,
  flightOrchestrator,
  itineraryOrchestrator,
  type SearchInput,
  type ScoredFlight,
  type TripInput,
  type ItineraryResult,
} from "../lib/agents";

/* ---------------- PAGE UI ---------------- */

type Tab = "Flights" | "Itinerary";

export default function Planner() {
  const [tab, setTab] = useState<Tab>("Itinerary");

  // Flights state
  const [flightInput, setFlightInput] = useState<SearchInput>({
    from: "",
    to: "",
    date: "",
  });
  const [flightResults, setFlightResults] = useState<ScoredFlight[]>([]);
  const [flightTrace, setFlightTrace] = useState<string[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ScoredFlight | null>(null);
  const [approved, setApproved] = useState(false);

  // Itinerary state
  const [tripInput, setTripInput] = useState<TripInput>({
    city: "Mumbai",
    days: 3,
    budgetStyle: "Value",
    interests: ["Food", "History", "Photography"],
  });
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);

  const interestOptions = useMemo(() => Array.from(INTEREST_OPTIONS), []);

  const toggleInterest = (tag: TripInput["interests"][number]) => {
    setTripInput((prev) => {
      const exists = prev.interests.includes(tag);
      const interests = exists
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag];
      return { ...prev, interests };
    });
  };

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "var(--accent)",
            }}
          />
          <div>Disha.travel Planner</div>
        </div>

        <div className="tabs">
          <button
            className={tab === "Itinerary" ? "tab tabActive" : "tab"}
            onClick={() => setTab("Itinerary")}
          >
            Itinerary
          </button>
          <button
            className={tab === "Flights" ? "tab tabActive" : "tab"}
            onClick={() => setTab("Flights")}
          >
            Flights
          </button>
        </div>
      </div>

      <div className="grid2">
        {/* LEFT: Inputs */}
        <div className="card">
          {tab === "Flights" ? (
            <>
              <div className="cardHeader">
                <div>
                  <h2 className="title">Flight Trade-off Planner</h2>
                  <div className="subtitle">
                    Ranks options using price, time, and stops with an explainable trace.
                  </div>
                </div>
                <span className="pill">Approval gate</span>
              </div>

              <div className="formRow">
                <input
                  className="input"
                  placeholder="From (e.g., Chennai)"
                  value={flightInput.from}
                  onChange={(e) =>
                    setFlightInput({ ...flightInput, from: e.target.value })
                  }
                />
                <input
                  className="input"
                  placeholder="To (e.g., Mumbai)"
                  value={flightInput.to}
                  onChange={(e) =>
                    setFlightInput({ ...flightInput, to: e.target.value })
                  }
                />
                <input
                  className="input"
                  type="date"
                  value={flightInput.date}
                  onChange={(e) =>
                    setFlightInput({ ...flightInput, date: e.target.value })
                  }
                />
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
                  <div className="subtitle">
                    Interests → POIs → schedule with constraints and full reasoning trace.
                  </div>
                </div>
                <span className="pill">Explainable planning</span>
              </div>

              <div
                className="formRow"
                style={{ gridTemplateColumns: "1.2fr 0.8fr 1fr" }}
              >
                <select
                  className="input"
                  value={tripInput.city}
                  onChange={(e) =>
                    setTripInput({ ...tripInput, city: e.target.value })
                  }
                >
                  {CITY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  className="input"
                  type="number"
                  min={1}
                  max={7}
                  value={tripInput.days}
                  onChange={(e) =>
                    setTripInput({ ...tripInput, days: Number(e.target.value) })
                  }
                />

                <select
                  className="input"
                  value={tripInput.budgetStyle}
                  onChange={(e) =>
                    setTripInput({
                      ...tripInput,
                      budgetStyle: e.target.value as TripInput["budgetStyle"],
                    })
                  }
                >
                  <option value="Shoestring">Shoestring</option>
                  <option value="Value">Value</option>
                  <option value="Comfort">Comfort</option>
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="small" style={{ marginBottom: 8 }}>
                  Interests (select 2–5)
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {interestOptions.map((tag) => {
                    const active = tripInput.interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        className={active ? "tab tabActive" : "tab"}
                        onClick={() => toggleInterest(tag)}
                        type="button"
                      >
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

                <button className="btnGhost" onClick={() => setItinerary(null)}>
                  Clear
                </button>
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

        {/* RIGHT: Outputs */}
        <div className="card">
          {tab === "Flights" ? (
            <>
              <div className="cardHeader">
                <div>
                  <h2 className="title">Ranked Options</h2>
                  <div className="subtitle">
                    Select an option, review trace, then approve redirect.
                  </div>
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
                          <div className="small">
                            ₹{r.price} • {r.duration} min • Stops: {r.stops} •{" "}
                            {r.type}
                          </div>
                        </div>
                        <span className="pill">Score: {Math.round(r.score)}</span>
                      </div>

                      <details>
                        <summary>Reasoning Trace</summary>
                        <div className="small" style={{ marginTop: 8 }}>
                          <div>
                            <b>Formula:</b> {r.breakdown.formula}
                          </div>
                          <div>
                            <b>Weights:</b> wPrice={r.breakdown.wPrice},
                            wDuration={r.breakdown.wDuration}, stopPenalty=
                            {r.breakdown.stopPenalty}
                          </div>

                          <div className="hr" />

                          <div>
                            Price: ₹{r.price} × {r.breakdown.wPrice} ={" "}
                            <b>{Math.round(r.breakdown.priceComponent)}</b>
                          </div>
                          <div>
                            Duration: {r.duration} × {r.breakdown.wDuration} ={" "}
                            <b>{Math.round(r.breakdown.durationComponent)}</b>
                          </div>
                          <div>
                            Stops: {r.stops} × {r.breakdown.stopPenalty} ={" "}
                            <b>{Math.round(r.breakdown.stopsComponent)}</b>
                          </div>

                          <div className="hr" />

                          <div>
                            <b>Total:</b>{" "}
                            {Math.round(r.breakdown.totalScore)}
                          </div>
                        </div>
                      </details>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btnGhost"
                          onClick={() => setSelectedFlight(r)}
                        >
                          Select
                        </button>

                        {selectedFlight?.id === r.id && !approved && (
                          <button
                            className="btn btnOk"
                            onClick={() => setApproved(true)}
                          >
                            Approve Redirect
                          </button>
                        )}

                        {selectedFlight?.id === r.id && approved && (
                          <a
                            className="btn"
                            href="https://www.skyscanner.co.in"
                            target="_blank"
                            rel="noreferrer"
                          >
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
                      <div key={i} style={{ marginBottom: 6 }}>
                        {i + 1}. {t}
                      </div>
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
                  <div className="subtitle">
                    Day-wise itinerary with constraints and full reasoning trace.
                  </div>
                </div>
              </div>

              {!itinerary ? (
                <div className="small">
                  Choose inputs and click <b>Generate Itinerary</b>.
                </div>
              ) : (
                <>
                  <div className="kpiRow">
                    <span className="kpi">City: {tripInput.city}</span>
                    <span className="kpi">
                      Days: {Math.max(1, Math.min(7, tripInput.days))}
                    </span>
                    <span className="kpi">
                      Budget: {itinerary.constraints.budgetStyle}
                    </span>
                    <span className="kpi">
                      Max “Medium”/day: {itinerary.constraints.maxPaidPerDay}
                    </span>
                  </div>

                  {itinerary.itinerary.map((d) => (
                    <div className="day" key={d.day}>
                      <div className="dayTitle">
                        Day {d.day} • {d.theme}
                      </div>

                      <div className="small">
                        {d.blocks.map((b, i) => (
                          <div key={i} style={{ marginTop: 6 }}>
                            <b>{b.time}:</b> {b.activity}{" "}
                            <span className="pill">{b.cost}</span>
                            {b.note ? (
                              <div className="small" style={{ marginTop: 2 }}>
                                {b.note}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <details style={{ marginTop: 12 }}>
                    <summary>Agent Reasoning Trace</summary>
                    <div className="small" style={{ marginTop: 8 }}>
                      {itinerary.reasoning.map((t, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                          {i + 1}. {t}
                        </div>
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