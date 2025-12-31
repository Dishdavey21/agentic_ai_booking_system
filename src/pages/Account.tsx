import { useEffect, useState } from "react";

export default function Account() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("disha_name");
    if (saved) setName(saved);
  }, []);

  return (
    <div className="card">
      <h2 className="title">Account</h2>
      <p className="subtitle">Demo profile (stored locally for now).</p>

      <div className="hr" />

      <label className="small">Your name</label>
      <input
        className="input"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginTop: 8, maxWidth: 420 }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button
          className="btn btnOk"
          onClick={() => localStorage.setItem("disha_name", name)}
        >
          Save
        </button>
        <button
          className="btnDanger"
          onClick={() => {
            localStorage.removeItem("disha_name");
            setName("");
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}