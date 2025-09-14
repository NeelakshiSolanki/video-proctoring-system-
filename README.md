🎥 AI Video Proctoring System
An AI-powered online interview proctoring system that monitors candidates during interviews. The system detects focus, suspicious behavior, and generates detailed reports for interviewers.

🚀 Features
 - Real-time face & object detection (MediaPipe FaceMesh + COCO-SSD)
 - Eye closure & look-away detection (focus monitoring)
 - Suspicious object detection (cell phone, book, paper)
 - Multiple face detection
 - No-face & drowsiness detection with thresholds
 - Session video recording and secure upload
 - Structured report generation with Integrity Score
 - MongoDB Compass integration for report storage
 - Interviewer dashboard to review sessions, videos & reports

🛠 Tech Stack
Frontend: React.js
Backend: Node.js + Express.js
Database: MongoDB (via MongoDB Compass)

AI Models:
MediaPipe FaceMesh
TensorFlow COCO-SSD
File Uploads: Multer
Video Processing: MediaRecorder API

📂 Project Structure

video-proctoring-system/
│── frontend-react/        # React frontend
│   ├── src/       # React components
│   └── public/    # Static assets
│
│── backend/        # Express + MongoDB backend
│   ├── server.js  # Main backend logic
│   └── models/    # Mongoose models
    │── uploads/    # candidate recordings (auto-created)
│    
│── README.md


⚙️ Setup Instructions
1️⃣ Clone the Repository

git clonehttps://github.com/NeelakshiSolanki/video-proctoring-system-.git
cd video-proctoring-system
2️⃣ Setup Backend (Node + Express)

cd backend
npm install
node server.js

➡ Runs backend at http://localhost:4000

MongoDB must be running locally. If you’re using MongoDB Compass:

Open Compass

Connect to:


mongodb://localhost:27017/interviewDB
You will see a collection reports storing all proctoring session data.

3️⃣ Setup Frontend (React)

cd frontend-react
npm install
npm start
➡ Runs frontend at http://localhost:3000

🌍 Deployment
Frontend → Deploy on Vercel

Backend → Deploy on Render

Database → Use MongoDB Atlas or connect your local MongoDB Compass instance

📊 Sample Report
yaml
Copy code
Candidate: John Doe
Interview Duration: 320 sec
Focus Lost: 3 times
No Face Detected: 1 times
Multiple Faces Detected: 0 times
Suspicious Objects Detected: 2 times
Integrity Score: 79
Stored inside MongoDB Compass under:
interviewDB > reports


📸 Screenshots
 1.  ![image alt](https://github.com/NeelakshiSolanki/video-proctoring-system-/blob/947c2ec8002ca2e383a05dbc6abdba10dc77b314/Screenshot%202025-09-14%20135255.png)
 2. ![image alt](https://github.com/NeelakshiSolanki/video-proctoring-system-/blob/fcbc5e69170e2b39308b0b7224d4acdd0ce4f3c5/Screenshot%202025-09-14%20135612.png)
📷 Candidate Session (Live Monitoring)

📷 Event Log & Structured Report

📷 MongoDB Compass storing Reports

🎥 Demo Video
📌 Upload a 2–3 min demo to YouTube/Google Drive and add the link here.

👩‍💻 Author
Neelakshi Solanki
🔗 GitHub
