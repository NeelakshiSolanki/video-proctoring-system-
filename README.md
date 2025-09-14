1 <!doctype html>
2 <html lang="en">
3 <head>
4   <meta charset="utf-8" />
5   <meta name="viewport" content="width=device-width, initial-scale=1" />
6   <title>Interview Proctor</title>
7   <!-- CDN scripts for TensorFlow.js and a pretrained object-detection + face-mesh / mediapipe -->
8   <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.8.0/dist/tf.min.js"></script>
9   <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"></script>
10  <!-- we'll use @mediapipe/face_mesh via CDN for face landmarks (gaze/eyes) -->
11  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
12  <style>
13    /* simple inline styles so no external CSS file needed */
14    body { font-family: Arial, sans-serif; margin: 12px; background:#fafafa; }
15    #video { width: 640px; height: 480px; background: #000; }
16    #overlay { position: absolute; left: 12px; top: 120px; }
17    .panel { margin-top: 12px; }
18    #log { white-space: pre-wrap; background:#fff; padding:8px; height:150px; overflow:auto; border:1px solid #ddd; }
19  </style>
20</head>
21<body>
22  <h1>Interview Proctor — Live</h1>
23  <div>
24    <video id="video" autoplay muted playsinline></video>
25    <canvas id="canvas" width="640" height="480" style="position: absolute; margin-left:12px; margin-top:0;"></canvas>
26  </div>
27  <div class="panel">
28    Candidate: <input id="candidateName" placeholder="Name" />
29    <button id="startBtn">Start Session</button>
30    <button id="stopBtn" disabled>Stop & Generate Report</button>
31  </div>
32  <div class="panel">
33    <strong>Event Log</strong>
34    <div id="log"></div>
35  </div>
36  <script src="proctor.js"></script>
37</body>
38</html>
