import { useState } from "react";

/* ---------------- AGENT TYPES ---------------- */

type SearchInput = {
  from: string;
  to: string;
  date: string;
};

type FlightOption = {
  id: string;
  carrier: string;
  price: number;
  duration: number;
  stops: number;
  type: "BUDGET" | "PREMIUM";
};

/* ---------------- WORKER AGENTS ---------------- */

// Budget Agent
function budgetAgent(input: SearchInput): FlightOption[] {
  return [
    {
      id: "B1",
      carrier: "BudgetAir",
      price: 42000,
      duration: 780,
      stops: 1,
      type: "BUDGET",
    },
    {
      id: "B2",
      carrier: "CheapFly",
      price: 39000,
      duration: 900,
      stops: 2,
      type: "BUDGET",
    },
  ];
}

// Premium Agent
function premiumAgent(input: SearchInput): FlightOption[] {
  return [
    {
      id: "P1",
      carrier: "Premium Airlines",
      price: 78000,
      duration: 540,
      stops: 0,
      type: "PREMIUM",
    },
    {
      id: "P2",
      carrier: "Global Air",
      price: 72000,
      duration: 600,
      stops: 1,
      type: "PREMIUM",
    },
  ];
}

// Analyst Agent (scores trade-offs)
function scoreFlight(f: FlightOption): number {
  return f.price * 0.5 + f.duration * 0.3 + f.stops * 10000;
}

/* ---------------- ORCHESTRATOR ---------------- */

function orchestrator(input: SearchInput) {
  const budget = budgetAgent(input);
  const premium = premiumAgent(input);

  const combined = [...budget, ...premium]
    .map((f) => ({
      ...f,
      score: scoreFlight(f),
    }))
    .sort((a, b) => a.score - b.score);

  return combined;
}

/* ---------------- UI ---------------- */

export default function App() {
  const [input, setInput] = useState<SearchInput>({
    from: "",
    to: "",
    date: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [approved, setApproved] = useState(false);

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Agentic AI Flight Planner</h1>

      {/* SEARCH */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="From"
          value={input.from}
          onChange={(e) => setInput({ ...input, from: e.target.value })}
        />
        <input
          placeholder="To"
          value={input.to}
          onChange={(e) => setInput({ ...input, to: e.target.value })}
        />
        <input
          type="date"
          value={input.date}
          onChange={(e) => setInput({ ...input, date: e.target.value })}
        />
        <button
          onClick={() => setResults(orchestrator(input))}
          style={{ marginLeft: 10 }}
        >
          Search
        </button>
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <>
          <h2>Agent Comparison Results</h2>
          {results.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 8,
              }}
            >
              <b>{r.carrier}</b> ({r.type})<br />
              ₹{r.price} | {r.duration} min | Stops: {r.stops}
              <br />
              <small>Score: {Math.round(r.score)}</small>
              <br />
              <button onClick={() => setSelected(r)}>Select</button>
            </div>
          ))}
        </>
      )}

      {/* APPROVAL GATE */}
      {selected && !approved && (
        <div style={{ marginTop: 20, borderTop: "2px solid black" }}>
          <h3>Approval Required</h3>
          <p>
            You selected <b>{selected.carrier}</b> for ₹{selected.price}
          </p>
          <p>
            The system will redirect you to the airline website to complete
            booking.
          </p>
          <button onClick={() => setApproved(true)}>Approve</button>
        </div>
      )}

      {/* CHECKOUT */}
      {approved && (
        <div style={{ marginTop: 20 }}>
          <h3>Redirecting to Checkout</h3>
          <a
            href="https://www.skyscanner.co.in"
            target="_blank"
            rel="noreferrer"
          >
            Continue to Provider
          </a>
        </div>
      )}
    </div>
  );
}