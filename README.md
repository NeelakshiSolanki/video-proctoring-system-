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


MONGODB_URI=mongodb+srv://neeLAKshi:neeLAKshi@cluster0.xxxxx.mongodb.net/interviewDB?retryWrites=true&w=majority


All proctoring reports will be stored in the reports collection under interviewDB database.
You will see a collection reports storing all proctoring session data.

3️⃣ Setup Frontend (React)

cd frontend-react
npm install
npm start
➡ Runs frontend at http://localhost:3000

🌍 Deployment
Frontend → Deploy on Vercel
Backend → Deploy on Render



📊 Sample Report
Candidate: John Doe
Interview Duration: 320 sec
Focus Lost: 3 times
No Face Detected: 1 times
Multiple Faces Detected: 0 times
Suspicious Objects Detected: 2 times
Integrity Score: 79
Stored inside MongoDB Compass under:
interviewDB > reports


📷 Candidate Session (Live Monitoring)
 1.  ![image alt](https://github.com/NeelakshiSolanki/video-proctoring-system-/blob/d715e2d9f1b6639c62f2478a6367619379bcb167/Screenshot%202025-09-15%20191118.png)  

  


📷 Event Log & Structured Report
 2. ![image alt](https://github.com/NeelakshiSolanki/video-proctoring-system-/blob/729ca0ddc784d5c388cba1e12bdf0934afa82fb3/Screenshot%202025-09-15%20191211.png)







👩‍💻 Author
Neelakshi Solanki
🔗 GitHub
