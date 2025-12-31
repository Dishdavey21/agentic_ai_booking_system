import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, alignItems: "center" }}>
          <div>
            <h1 className="heroTitle">Disha.travel</h1>
            <p className="heroSub">
              An agentic travel planning platform that orchestrates specialist AI agents to produce explainable
              itineraries, flight trade-off analysis, and guided next actions.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <Link className="btn" to="/planner">Open Planner</Link>
              <Link className="btnGhost" to="/chat">Try Chat</Link>
              <Link className="btnGhost" to="/about">Architecture</Link>
            </div>

            <div className="kpiRow" style={{ marginTop: 16 }}>
              <span className="kpi">Orchestrator–Worker</span>
              <span className="kpi">Reasoning Trace</span>
              <span className="kpi">Approval Gate</span>
              <span className="kpi">Modular Agents</span>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>What this does</div>
            <div className="small">
              <ul>
                <li>Generates day-by-day itinerary based on interests + budget style</li>
                <li>Explains the planning decisions with full agent trace</li>
                <li>Compares flight options with transparent scoring</li>
                <li>Chat can drive the planner end-to-end (next step)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2 className="title">Planner</h2>
          <div className="subtitle">
            Generate itineraries and evaluate flight trade-offs with explainable reasoning traces.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link className="btn" to="/planner">Go to Planner</Link>
          </div>
        </div>

        <div className="card">
          <h2 className="title">Chat</h2>
          <div className="subtitle">
            Natural language interface that triggers agents as tools and produces structured outputs.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link className="btnGhost" to="/chat">Open Chat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}