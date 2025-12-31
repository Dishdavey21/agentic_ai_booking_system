import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card">
      <h1 className="heroTitle">Agentic AI Travel Platform</h1>
      <p className="heroSub">
        A multi-agent travel planning system: flights trade-offs, explainable
        itinerary generation, and an orchestration-driven chat experience.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <Link className="btn" to="/planner">
          Open Planner
        </Link>
        <Link className="btnGhost" to="/about">
          How it works
        </Link>
      </div>

      <div className="kpiRow" style={{ marginTop: 16 }}>
        <span className="kpi">Orchestrator–Worker</span>
        <span className="kpi">Reasoning trace</span>
        <span className="kpi">Human approval gate</span>
        <span className="kpi">Modular agents</span>
      </div>
    </div>
  );
}