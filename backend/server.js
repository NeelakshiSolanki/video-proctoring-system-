// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000; // Backend server port

// Enable CORS
app.use(cors());

// For JSON body parsing (report data)
app.use(express.json());

// Serve uploaded videos statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Temporary in-memory reports storage (replace later with DB)
let reports = [];

// Multer setup for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Test API
app.get("/api/upload", (req, res) => {
  res.send("Upload API is working! Use POST to send video & report.");
});

// Upload endpoint
app.post("/api/upload", upload.single("video"), (req, res) => {
  try {
    const videoFile = req.file;
    const reportData = req.body.report ? JSON.parse(req.body.report) : {};

    if (!videoFile) {
      return res.status(400).json({ success: false, message: "No video uploaded" });
    }

    // Add videoPath to report
    reportData.videoPath = videoFile.filename;
    reports.push(reportData);

    console.log("Video saved at:", videoFile.path);
    console.log("Report:", reportData);

    return res.json({
      success: true,
      message: "Video & report uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch reports API
app.get("/api/reports", (req, res) => {
  res.json(reports.reverse()); // latest first
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
