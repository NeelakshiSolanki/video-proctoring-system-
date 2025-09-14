import React, { useState } from "react";
import Proctor from "./proctor";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [view, setView] = useState("proctor"); // "proctor" or "dashboard"

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">🎥 Interview System</h1>
        <div className="view-buttons" style={{ margin: "20px 0" }}>
          <button className="glow-button" onClick={() => setView("proctor")} style={{ marginRight: "10px" }}>
            Candidate Session
          </button>
          <button className="glow-button" onClick={() => setView("dashboard")}>
            Interviewer Dashboard
          </button>
        </div>
      </header>

      <div style={{ padding: "20px" }}>
        {view === "proctor" && <Proctor />}
        {view === "dashboard" && <Dashboard />}
      </div>

      {/* optional bubbles for background */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export default App;
