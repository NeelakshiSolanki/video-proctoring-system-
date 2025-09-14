// server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Connect to MongoDB Atlas
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://neeLAKshi:neeLAKshi@cluster0.fiwuyb6.mongodb.net/interviewDB?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// Report Schema
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

// Multer Storage for uploaded videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Upload Endpoint
app.post("/api/upload", upload.single("video"), async (req, res) => {
  try {
    const { report } = req.body;
    if (!report) {
      return res
        .status(400)
        .json({ status: "error", message: "Report missing" });
    }

    const r = JSON.parse(report);

    // Compute integrity score
    const deductions =
      (r.focusLostCount || 0) * 5 +
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
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Fetch Reports Endpoint
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(Array.isArray(reports) ? reports : []); // always send array
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.json([]); // instead of sending object, send empty array
  }
});

// Serve uploaded videos
app.use("/uploads", express.static(uploadDir));

// Serve React frontend (production build)
const frontendPath = path.join(__dirname, "frontend-react/build");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
