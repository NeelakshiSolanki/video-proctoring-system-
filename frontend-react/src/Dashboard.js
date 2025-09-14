import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let retries = 3;       // number of retry attempts
    const delay = 2000;    // delay between retries (ms)

    const fetchReports = async () => {
      try {
        const res = await fetch(
          "https://video-proctoring-backend-2nmr.onrender.com/api/reports"
        );

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Invalid data format");

        setReports(data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err);

        if (retries > 0) {
          retries -= 1;
          setTimeout(fetchReports, delay); // retry after delay
        } else {
          setError(err.message || "Failed to fetch reports");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading reports...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

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
          <h3 style={{ color: "#ff7b00" }}>{r.candidate || "Unknown Candidate"}</h3>
          <p>Interview Duration: {r.duration || 0} sec</p>
          <p>Focus Lost: {r.focusLostCount || 0} times</p>
          <p>No Face Detected: {r.noFaceCount || 0} times</p>
          <p>Multiple Faces Detected: {r.multipleFacesCount || 0} times</p>
          <p>Suspicious Objects Detected: {r.suspiciousObjectCount || 0} times</p>
          <p>Integrity Score: {r.integrityScore || 0}</p>

          <strong>Events:</strong>
          <ul>
            {Array.isArray(r.events) && r.events.length > 0 ? (
              r.events.map((e, i) => <li key={i}>{e}</li>)
            ) : (
              <li>No events recorded</li>
            )}
          </ul>

          {r.videoPath && (
            <video
              src={`https://video-proctoring-backend-2nmr.onrender.com/${r.videoPath}`}
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
