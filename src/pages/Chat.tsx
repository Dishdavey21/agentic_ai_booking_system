export default function Chat() {
  return (
    <div className="card">
      <h2 className="title">Chat</h2>
      <p className="subtitle">
        Next step: natural-language interface that triggers your orchestrator and agents.
      </p>

      <div className="hr" />

      <div className="small">
        Coming next:
        <ul>
          <li>Parse user message (intent + entities)</li>
          <li>Call Planner agents as “tools”</li>
          <li>Show reasoning trace + next actions</li>
        </ul>
      </div>
    </div>
  );
}