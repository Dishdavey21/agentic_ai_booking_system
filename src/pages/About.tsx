export default function About() {
  return (
    <div className="card">
      <h2 className="title">About</h2>
      <p className="subtitle">
        This project demonstrates an Orchestrator–Worker agentic architecture for
        travel logistics. The orchestrator decomposes goals into tasks, delegates
        to specialist agents, and provides an explainable trace with optional
        human approval for sensitive actions.
      </p>

      <div className="hr" />

      <div className="small">
        Core modules:
        <ul>
          <li>Flight Trade-off Planner (Budget vs Premium agents + scoring)</li>
          <li>Itinerary Generator (Interests → POIs → Schedule agents)</li>
          <li>Chat Orchestrator (next step: natural language control)</li>
        </ul>
      </div>
    </div>
  );
}