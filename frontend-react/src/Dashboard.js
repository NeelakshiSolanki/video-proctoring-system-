import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h2 style={{ color: "#ff7b00" }}>Interviewer Dashboard</h2>
      {reports.length === 0 && <p>No reports yet.</p>}

      {reports.map((r, idx) => (
        <div
          key={idx}
          style={{
            border: "2px solid #ff7b00",
            margin: "15px 0",
            padding: "15px",
            borderRadius: "12px",
            background: "#1a1a1a",
            color: "#fff",
          }}
        >
          <h3 style={{ color: "#ff7b00" }}>{r.candidate}</h3>
          <p>Interview Duration: {r.duration} sec</p>
          <p>Focus Lost: {r.focusLostCount} times</p>
          <p>No Face Detected: {r.noFaceCount} times</p>
          <p>Multiple Faces Detected: {r.multipleFacesCount} times</p>
          <p>Suspicious Objects Detected: {r.suspiciousObjectCount} times</p>
          <p>Integrity Score: {r.integrityScore}</p>

          <strong>Events:</strong>
          <ul>
            {r.events.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>

          {r.videoPath && (
            <video
              src={`http://localhost:4000/${r.videoPath}`}
              controls
              width={400}
              style={{ borderRadius: "10px", marginTop: "10px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
