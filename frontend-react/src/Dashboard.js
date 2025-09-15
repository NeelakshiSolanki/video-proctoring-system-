import React, { useEffect, useState, useRef } from "react";
import './Dashboard.css';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const videoRefs = useRef({});

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reverse()); // show latest first
      } else {
        console.error("Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Candidate Reports</h1>
      {reports.length === 0 && <p>No reports yet.</p>}
      {reports.map((report, idx) => (
        <div key={idx} className="report-card">
          <h2>{report.candidate}</h2>
          <p>Duration: {report.duration} sec</p>
          <p>Focus Lost: {report.focusLostCount}</p>
          <p>No Face Detected: {report.noFaceCount}</p>
          <p>Multiple Faces: {report.multipleFacesCount}</p>
          <p>Suspicious Objects: {report.suspiciousObjectCount}</p>
          <p>
            <strong>Integrity Score: {report.integrityScore}</strong>
          </p>

          {/* Recorded Video */}
          {report.videoPath && (
            <video
              width="480"
              controls
              ref={(el) => (videoRefs.current[report._id] = el)}
              className="report-video"
            >
              <source
                src={`${API_BASE}/uploads/${report.videoPath}`}
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Event Log */}
          <details>
            <summary>Event Log ({report.events.length})</summary>
            <div className="event-log">
              {report.events.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}
