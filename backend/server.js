const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// CORS - allow deployed frontend
app.use(cors({
  origin: "https://video-proctoring-frontend-e2ap1eowj.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Schema & Model
const reportSchema = new mongoose.Schema({
  candidate: String,
  timestamp: { type: Date, default: Date.now },
  events: [String],
  videoPath: String,
  duration: Number,
  focusLostCount: Number,
  noFaceCount: Number,
  multipleFacesCount: Number,
  suspiciousObjectCount: Number,
  integrityScore: Number,
});
const Report = mongoose.model("Report", reportSchema);

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Upload Endpoint
app.post("/api/upload", upload.single("video"), async (req, res) => {
  try {
    const { report } = req.body;
    if (!report) return res.status(400).json({ status: "error", message: "Report missing" });

    const r = JSON.parse(report);
    const deductions = (r.focusLostCount || 0) * 5 +
                       (r.noFaceCount || 0) * 10 +
                       (r.multipleFacesCount || 0) * 15 +
                       (r.suspiciousObjectCount || 0) * 10;
    const integrityScore = Math.max(0, 100 - deductions);

    const newReport = new Report({
      candidate: r.candidate,
      events: r.events || [],
      videoPath: req.file ? "uploads/" + req.file.filename : null,
      duration: r.duration || 0,
      focusLostCount: r.focusLostCount || 0,
      noFaceCount: r.noFaceCount || 0,
      multipleFacesCount: r.multipleFacesCount || 0,
      suspiciousObjectCount: r.suspiciousObjectCount || 0,
      integrityScore,
    });

    await newReport.save();
    res.json({ status: "success", message: "Report saved" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Fetch Reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Serve uploaded videos
app.use("/uploads", express.static(uploadDir));

// Serve React frontend
app.use(express.static(path.join(__dirname, "frontend-react/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend-react/build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
