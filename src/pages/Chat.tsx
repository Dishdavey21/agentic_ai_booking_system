import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
  CITY_LIST,
  INTEREST_OPTIONS,
  flightOrchestrator,
  itineraryOrchestrator,
  type ItineraryResult,
  type SearchInput,
  type ScoredFlight,
  type TripInput,
} from "../lib/agents";
import { saveTripDraft } from "../lib/drafts";

/* ---------------- TYPES ---------------- */

type ChatTurn =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      text: string;
      kind: "itinerary" | "flights";
      trace: string[];
      payload: ItineraryResult | { results: ScoredFlight[]; trace: string[] };
      derivedInput: TripInput | SearchInput;
    };

/* ---------------- NLP HELPERS ---------------- */

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function pickCity(text: string): string | null {
  const t = normalize(text);
  for (const c of CITY_LIST) {
    if (t.includes(c.toLowerCase())) return c;
  }
  return null;
}

function pickDays(text: string): number | null {
  const m = text.match(/(\d+)\s*-\s*day|(\d+)\s*days?/i);
  const n = Number(m?.[1] || m?.[2]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(7, Math.max(1, n));
}

function pickBudgetStyle(text: string): TripInput["budgetStyle"] {
  const t = normalize(text);
  if (t.includes("shoe") || t.includes("cheap") || t.includes("budget")) return "Shoestring";
  if (t.includes("comfort") || t.includes("lux") || t.includes("premium")) return "Comfort";
  return "Value";
}

function pickInterests(text: string): string[] {
  const t = normalize(text);
  const found: string[] = [];

  for (const tag of INTEREST_OPTIONS) {
    if (t.includes(tag.toLowerCase())) found.push(tag);
  }

  if (found.length === 0) return ["Food", "Local", "Photography"];
  return Array.from(new Set(found)).slice(0, 5);
}

function pickFromTo(text: string): { from: string | null; to: string | null } {
  const m = text.match(/from\s+(.+?)\s+to\s+(.+)/i);
  if (!m) return { from: null, to: null };
  return { from: m[1].trim(), to: m[2].trim() };
}

function pickDate(text: string): string | null {
  const m = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return m ? m[1] : null;
}

function inferIntent(text: string): "itinerary" | "flights" {
  const t = normalize(text);
  if (t.includes("flight") || t.includes("from") || t.includes("to")) return "flights";
  return "itinerary";
}

/* ---------------- CHAT PAGE ---------------- */

export default function Chat() {
  const nav = useNavigate();

  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  function applyToPlanner(
  payload: TripInput | SearchInput,
  tab: "Flights" | "Itinerary"
) {
  if (tab === "Flights") {
    saveTripDraft({
      tab: "Flights",
      data: payload as SearchInput,
    });
  } else {
    saveTripDraft({
      tab: "Itinerary",
      data: payload as TripInput,
    });
  }

  nav("/planner");
}

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    setTurns((prev) => [...prev, { role: "user", text }]);
    setInput("");

    const intent = inferIntent(text);

    if (intent === "flights") {
      const { from, to } = pickFromTo(text);
      const date = pickDate(text) ?? "";

      const flightInput: SearchInput = { from: from ?? "", to: to ?? "", date };
      const out = flightOrchestrator(flightInput);

      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          kind: "flights",
          text: "I found and ranked flight options. You can apply them to Planner.",
          trace: out.trace,
          payload: out,
          derivedInput: flightInput,
        },
      ]);
      return;
    }

    const tripInput: TripInput = {
      city: pickCity(text) ?? "Mumbai",
      days: pickDays(text) ?? 3,
      budgetStyle: pickBudgetStyle(text),
      interests: pickInterests(text),
    };

    const out = itineraryOrchestrator(tripInput);

    setTurns((prev) => [
      ...prev,
      {
        role: "assistant",
        kind: "itinerary",
        text: "I generated a full itinerary with reasoning. You can apply it to Planner.",
        trace: out.reasoning,
        payload: out,
        derivedInput: tripInput,
      },
    ]);
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--accent)" }} />
          <div>AI.travel Chat</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {turns.map((t, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <b>{t.role === "user" ? "You" : "AI"}:</b> {t.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              className="input"
              placeholder="Ask me to plan a trip or find flights…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="btn btnOk" disabled={!canSend} onClick={handleSend}>
              Send
            </button>
          </div>
        </div>

        <div className="card">
          {(() => {
            const last = [...turns].reverse().find((x) => x.role === "assistant");
            if (!last) return <div className="small">No output yet.</div>;

            return (
              <button
                className="btn btnOk"
                onClick={() => applyToPlanner(last.derivedInput, last.kind === "flights" ? "Flights" : "Itinerary")}
              >
                Apply to Planner
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}