import React, { useEffect, useRef, useState } from "react";

export default function Proctor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [logLines, setLogLines] = useState([]);
  const [candidate, setCandidate] = useState("");
  const [running, setRunning] = useState(false);

  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const cocoModelRef = useRef(null);
  const faceMeshRef = useRef(null);
  const detectionLoopRef = useRef(null);
  const eventsRef = useRef([]);

  const LOOK_AWAY_THRESHOLD = 5000;
  const NO_FACE_THRESHOLD = 10000;
  const lastFaceTimeRef = useRef(Date.now());
  const lastLookAwayTimeRef = useRef(null);
  const sessionStartRef = useRef(null);

  // Counters for structured report
  const focusLostCountRef = useRef(0);
  const noFaceCountRef = useRef(0);
  const multipleFacesCountRef = useRef(0);
  const suspiciousObjectCountRef = useRef(0);

  const logEvent = (type, detail) => {
    const ts = new Date().toISOString();
    const msg = `${ts} | ${type} | ${detail}`;
    setLogLines((lines) => [msg, ...lines].slice(0, 500));
    eventsRef.current = [msg, ...eventsRef.current].slice(0, 500);

    // Update counters
    if (detail.includes("user_looking_away")) focusLostCountRef.current++;
    if (detail.includes("no_face_present")) noFaceCountRef.current++;
    if (detail.includes("multiple_faces_detected")) multipleFacesCountRef.current++;
    if (detail.includes("cell phone") || detail.includes("book") || detail.includes("paper"))
      suspiciousObjectCountRef.current++;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      return true;
    } catch (err) {
      alert("Camera access denied or not available");
      return false;
    }
  };

  const loadModels = async () => {
    if (!cocoModelRef.current && window.cocoSsd) {
      cocoModelRef.current = await window.cocoSsd.load();
      logEvent("model", "coco-ssd loaded");
    }

    if (!faceMeshRef.current && window.FaceMesh) {
      const fm = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      fm.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      fm.onResults(onFaceResults);
      faceMeshRef.current = fm;
      logEvent("model", "FaceMesh loaded");
    }
  };

  const startRecording = () => {
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const mr = new MediaRecorder(mediaStreamRef.current, { mimeType });

    mr.ondataavailable = (e) => {
      if (e.data.size) recordedChunksRef.current.push(e.data);
    };

    mr.start(1000);
    recorderRef.current = mr;
    logEvent("recorder", "started");
  };

  const onFaceResults = (results) => {
    const faces = results.multiFaceLandmarks || [];
    const now = Date.now();

    if (!faces.length) {
      if (now - lastFaceTimeRef.current > NO_FACE_THRESHOLD) {
        logEvent("suspicious", "no_face_present_>10s");
      }
    } else {
      lastFaceTimeRef.current = now;

      const lm = faces[0];
      const leftEye = lm[33],
        rightEye = lm[263],
        nose = lm[1];
      const midEyeX = (leftEye.x + rightEye.x) / 2;

      if (Math.abs(midEyeX - nose.x) > 0.06) {
        if (!lastLookAwayTimeRef.current) lastLookAwayTimeRef.current = now;
        else if (now - lastLookAwayTimeRef.current > LOOK_AWAY_THRESHOLD) {
          logEvent("suspicious", "user_looking_away_>5s");
          lastLookAwayTimeRef.current = now;
        }
      } else lastLookAwayTimeRef.current = null;

      if (faces.length > 1) logEvent("suspicious", "multiple_faces_detected");
    }
  };

  const handleObjects = async () => {
    if (!cocoModelRef.current || !videoRef.current) return;

    const predictions = await cocoModelRef.current.detect(videoRef.current);

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    predictions.forEach((pred) => {
      const [x, y, w, h] = pred.bbox;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "red";
      ctx.font = "16px sans-serif";
      ctx.fillText(`${pred.class} ${(pred.score * 100).toFixed(0)}%`, x, y - 5);

      if (["cell phone", "book", "paper"].includes(pred.class) && pred.score > 0.5) {
        logEvent("suspicious", `${pred.class}_detected`);
      }
    });
  };

  const detectionLoop = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      detectionLoopRef.current = requestAnimationFrame(detectionLoop);
      return;
    }

    await handleObjects();
    if (faceMeshRef.current) await faceMeshRef.current.send({ image: videoRef.current });

    detectionLoopRef.current = requestAnimationFrame(detectionLoop);
  };

  const startSession = async () => {
    if (!candidate) {
      alert("Enter candidate name");
      return;
    }
    const ok = await startCamera();
    if (!ok) return;
    await loadModels();
    sessionStartRef.current = Date.now();
    startRecording();
    detectionLoopRef.current = requestAnimationFrame(detectionLoop);
    setRunning(true);
    logEvent("session", `started for ${candidate}`);
  };

  const stopSession = async () => {
    setRunning(false);
    cancelAnimationFrame(detectionLoopRef.current);

    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());

    const sessionEnd = Date.now();
    const durationSec = Math.floor((sessionEnd - sessionStartRef.current) / 1000);

    const deductions =
      focusLostCountRef.current * 2 +
      noFaceCountRef.current * 3 +
      multipleFacesCountRef.current * 5 +
      suspiciousObjectCountRef.current * 5;

    const integrityScore = Math.max(0, 100 - deductions);

    const structuredReport = {
      candidate,
      duration: durationSec,
      focusLostCount: focusLostCountRef.current,
      noFaceCount: noFaceCountRef.current,
      multipleFacesCount: multipleFacesCountRef.current,
      suspiciousObjectCount: suspiciousObjectCountRef.current,
      integrityScore,
      events: eventsRef.current
    };

    // Upload video + report
    const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const form = new FormData();
    form.append("video", videoBlob, `${candidate}_${Date.now()}.webm`);
    form.append("report", JSON.stringify(structuredReport));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form
      });
      if (res.ok) logEvent("upload", "video uploaded successfully");
      else logEvent("upload", "backend error");
    } catch (err) {
      logEvent("upload", "failed - backend unreachable");
    }

    logEvent("session", "stopped");
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(detectionLoopRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="candidate-session">
      <div className="input-buttons">
        <label>
          Candidate Name:
          <input
            className="candidate-input"
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            placeholder="Enter Name"
          />
        </label>
        <button className="session-button" onClick={startSession} disabled={running}>
          Start
        </button>
        <button className="session-button" onClick={stopSession} disabled={!running}>
          Stop & Upload
        </button>
      </div>

      <div className="camera-container">
        <video ref={videoRef} width={640} height={480} playsInline muted className="camera-video" />
        <canvas ref={canvasRef} width={640} height={480} className="camera-canvas" />
      </div>

      {/* --- Structured Report --- */}
      <div className="report-summary">
        <p>Interview Duration: {Math.floor((Date.now() - sessionStartRef.current)/1000)} sec</p>
        <p>Focus Lost: {focusLostCountRef.current} times</p>
        <p>No Face Detected: {noFaceCountRef.current} times</p>
        <p>Multiple Faces Detected: {multipleFacesCountRef.current} times</p>
        <p>Suspicious Objects Detected: {suspiciousObjectCountRef.current} times</p>
        <p>
          Integrity Score:{" "}
          {Math.max(
            0,
            100 -
              (focusLostCountRef.current * 2 +
                noFaceCountRef.current * 3 +
                multipleFacesCountRef.current * 5 +
                suspiciousObjectCountRef.current * 5)
          )}
        </p>
      </div>

      {/* --- Event Log --- */}
      <div className="event-log">
        <strong>Event Log</strong>
        <div id="log">{logLines.map((l, i) => <div key={i}>{l}</div>)}</div>
      </div>
    </div>
  );
}
