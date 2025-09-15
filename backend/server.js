const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/videos", express.static(path.join(__dirname, "videos")));

const upload = multer({ dest: "videos/" });

// Upload endpoint for video + report
app.post("/api/upload", upload.single("video"), (req, res) => {
  try {
    const report = JSON.parse(req.body.report);
    const video = req.file;

    // Rename video to keep original name
    const newPath = path.join(__dirname, "videos", video.originalname);
    fs.renameSync(video.path, newPath);

    // Save report as JSON
    const reportsPath = path.join(__dirname, "reports.json");
    let allReports = [];
    if (fs.existsSync(reportsPath)) {
      allReports = JSON.parse(fs.readFileSync(reportsPath));
    }
    report.videoPath = `videos/${video.originalname}`;
    allReports.push(report);
    fs.writeFileSync(reportsPath, JSON.stringify(allReports, null, 2));

    res.status(200).json({ message: "Upload successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Get all reports
app.get("/api/reports", (req, res) => {
  const reportsPath = path.join(__dirname, "reports.json");
  if (fs.existsSync(reportsPath)) {
    const allReports = JSON.parse(fs.readFileSync(reportsPath));
    res.json(allReports);
  } else {
    res.json([]);
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
