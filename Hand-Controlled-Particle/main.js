// Global variables
let videoElement;
let canvasElement;
let canvasCtx;
let particlesCanvas;
let particlesCtx;
let hands;
let camera;
let particles = [];
let handPosition = { x: 0, y: 0 };
let handDetected = false;
let handGesture = "open"; // "open" or "closed"

// Configuration
let config = {
  particleCount: 150,
  particleSize: 3,
  attractionStrength: 0.5,
  colorMode: 0, // 0 = rainbow, 1 = fire, 2 = ice, 3 = neon
};

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  videoElement = document.getElementById("inputVideo");
  canvasElement = document.getElementById("canvasOutput");
  canvasCtx = canvasElement.getContext("2d");
  particlesCanvas = document.getElementById("particlesCanvas");
  particlesCtx = particlesCanvas.getContext("2d");

  // Set canvas sizes
  updateCanvasSizes();
  window.addEventListener("resize", updateCanvasSizes);

  // Initialize MediaPipe Hands
  initializeHandTracking();

  // Initialize particle system
  initializeParticles();

  // Start animation loop
  requestAnimationFrame(updateParticles);

  // Set up control sliders
  setupControls();
});

// Update canvas sizes based on container
function updateCanvasSizes() {
  const videoContainer = document.querySelector(".video-container");
  const particlesContainer = document.querySelector(".particles-container");

  canvasElement.width = videoContainer.clientWidth;
  canvasElement.height = videoContainer.clientHeight;

  particlesCanvas.width = particlesContainer.clientWidth;
  particlesCanvas.height = particlesContainer.clientHeight;

  // Reinitialize particles with new canvas size
  initializeParticles();
}

// Initialize MediaPipe Hand Tracking
function initializeHandTracking() {
  hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onHandResults);

  // Initialize camera
  camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start();
}

// Process hand tracking results
function onHandResults(results) {
  // Clear canvas
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Flip canvas horizontally to match video
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);

  // Draw video frame
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height,
  );

  // Reset transformation
  canvasCtx.restore();

  // Check if hand is detected
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    handDetected = true;
    document.querySelector(".hand-indicator").classList.add("hand-detected");
    document.getElementById("statusText").textContent = "Hand detected";

    // Get the first hand
    const landmarks = results.multiHandLandmarks[0];

    // Calculate hand center (using palm base and middle finger base)
    const palmBase = landmarks[0]; // Wrist
    const middleBase = landmarks[9]; // Middle finger MCP

    // Map coordinates to particle canvas
    handPosition.x =
      (1 - (palmBase.x + middleBase.x) / 2) * particlesCanvas.width;
    handPosition.y = ((palmBase.y + middleBase.y) / 2) * particlesCanvas.height;

    // Determine hand gesture (open or closed)
    // Simple method: check if fingertips are above knuckles
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const indexDip = landmarks[7];
    const middleTip = landmarks[12];
    const middleDip = landmarks[11];

    // Count how many fingers are extended
    let extendedFingers = 0;
    if (thumbTip.y < thumbIp.y) extendedFingers++;
    if (indexTip.y < indexDip.y) extendedFingers++;
    if (middleTip.y < middleDip.y) extendedFingers++;

    handGesture = extendedFingers >= 2 ? "open" : "closed";

    // Draw hand landmarks
    drawHandLandmarks(landmarks);
  } else {
    handDetected = false;
    document.querySelector(".hand-indicator").classList.remove("hand-detected");
    document.getElementById("statusText").textContent = "No hand detected";
  }
}

// Draw hand landmarks on video canvas
function drawHandLandmarks(landmarks) {
  canvasCtx.strokeStyle = "#00FF00";
  canvasCtx.lineWidth = 2;

  // Draw connections
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4], // Thumb
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8], // Index
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12], // Middle
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16], // Ring
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20], // Pinky
    [5, 9],
    [9, 13],
    [13, 17], // Across palm
  ];

  canvasCtx.beginPath();
  for (const [start, end] of connections) {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];

    canvasCtx.moveTo(
      startPoint.x * canvasElement.width,
      startPoint.y * canvasElement.height,
    );
    canvasCtx.lineTo(
      endPoint.x * canvasElement.width,
      endPoint.y * canvasElement.height,
    );
  }
  canvasCtx.stroke();

  // Draw landmarks
  canvasCtx.fillStyle = handGesture === "open" ? "#00FF00" : "#FF0000";
  for (const landmark of landmarks) {
    canvasCtx.beginPath();
    canvasCtx.arc(
      landmark.x * canvasElement.width,
      landmark.y * canvasElement.height,
      4,
      0,
      2 * Math.PI,
    );
    canvasCtx.fill();
  }
}

// Initialize particles
function initializeParticles() {
  particles = [];

  for (let i = 0; i < config.particleCount; i++) {
    particles.push({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * config.particleSize + 1,
      color: getParticleColor(i),
      originalSize: 0,
      life: Math.random() * 100,
    });

    particles[i].originalSize = particles[i].size;
  }
}

// Get particle color based on mode
function getParticleColor(index) {
  switch (config.colorMode) {
    case 0: // Rainbow
      const hue = ((index * 360) / config.particleCount) % 360;
      return `hsl(${hue}, 100%, 65%)`;
    case 1: // Fire
      return `hsl(${20 + Math.random() * 20}, 100%, 60%)`;
    case 2: // Ice
      return `hsl(${180 + Math.random() * 30}, 100%, 70%)`;
    case 3: // Neon
      const neonColors = ["#ff00ff", "#00ffff", "#ffff00", "#ff7700"];
      return neonColors[index % neonColors.length];
    default:
      return "#ffffff";
  }
}

// Update particles
function updateParticles() {
  // Clear canvas with fade effect
  particlesCtx.fillStyle = "rgba(10, 10, 20, 0.1)";
  particlesCtx.fillRect(0, 0, particlesCanvas.width, particlesCanvas.height);

  // Update and draw each particle
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Apply hand influence if detected
    if (handDetected) {
      const dx = handPosition.x - p.x;
      const dy = handPosition.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only affect particles within a certain radius
      const influenceRadius = particlesCanvas.width / 3;

      if (distance < influenceRadius) {
        // Normalize direction
        const angle = Math.atan2(dy, dx);

        // Strength based on distance (stronger when closer)
        const strength =
          (1 - distance / influenceRadius) * config.attractionStrength;

        if (handGesture === "open") {
          // Attract particles to hand
          p.vx += Math.cos(angle) * strength;
          p.vy += Math.sin(angle) * strength;
        } else {
          // Repel particles from hand
          p.vx -= Math.cos(angle) * strength;
          p.vy -= Math.sin(angle) * strength;
        }

        // Add some swirl effect based on hand position
        const swirlStrength = 0.05;
        p.vx += Math.cos(angle + Math.PI / 2) * swirlStrength;
        p.vy += Math.sin(angle + Math.PI / 2) * swirlStrength;

        // Increase size when near hand
        p.size = p.originalSize * (1 + (1 - distance / influenceRadius) * 2);
      } else {
        // Gradually return to original size
        p.size += (p.originalSize - p.size) * 0.05;
      }
    } else {
      // Gradually return to original size
      p.size += (p.originalSize - p.size) * 0.05;
    }

    // Apply velocity
    p.x += p.vx;
    p.y += p.vy;

    // Apply friction
    p.vx *= 0.98;
    p.vy *= 0.98;

    // Bounce off walls
    if (p.x < 0 || p.x > particlesCanvas.width) {
      p.vx *= -0.8;
      p.x = p.x < 0 ? 0 : particlesCanvas.width;
    }
    if (p.y < 0 || p.y > particlesCanvas.height) {
      p.vy *= -0.8;
      p.y = p.y < 0 ? 0 : particlesCanvas.height;
    }

    // Keep particles within bounds
    p.x = Math.max(0, Math.min(particlesCanvas.width, p.x));
    p.y = Math.max(0, Math.min(particlesCanvas.height, p.y));

    // Update particle life for color animation
    p.life += 0.5;

    // Draw particle
    drawParticle(p);
  }

  // Draw hand position indicator on particle canvas
  if (handDetected) {
    drawHandIndicator();
  }

  // Continue animation loop
  requestAnimationFrame(updateParticles);
}

// Draw a single particle
function drawParticle(p) {
  // Update color based on life and mode
  let color = p.color;
  if (config.colorMode === 0) {
    // Rainbow mode animates
    const hue = p.life % 360;
    color = `hsl(${hue}, 100%, 65%)`;
  }

  // Draw particle with glow effect
  particlesCtx.beginPath();
  particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  particlesCtx.fillStyle = color;
  particlesCtx.fill();

  // Add glow effect
  particlesCtx.beginPath();
  particlesCtx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
  const gradient = particlesCtx.createRadialGradient(
    p.x,
    p.y,
    p.size,
    p.x,
    p.y,
    p.size * 1.5,
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  particlesCtx.fillStyle = gradient;
  particlesCtx.fill();
}

// Draw hand position indicator on particle canvas
function drawHandIndicator() {
  const radius = handGesture === "open" ? 40 : 25;
  const color =
    handGesture === "open" ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)";

  // Draw outer circle
  particlesCtx.beginPath();
  particlesCtx.arc(handPosition.x, handPosition.y, radius, 0, Math.PI * 2);
  particlesCtx.fillStyle = color;
  particlesCtx.fill();

  // Draw inner circle
  particlesCtx.beginPath();
  particlesCtx.arc(
    handPosition.x,
    handPosition.y,
    radius * 0.5,
    0,
    Math.PI * 2,
  );
  particlesCtx.fillStyle =
    handGesture === "open" ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 0, 0, 0.6)";
  particlesCtx.fill();

  // Draw hand icon
  particlesCtx.fillStyle = "#FFFFFF";
  particlesCtx.font = "bold 20px Arial";
  particlesCtx.textAlign = "center";
  particlesCtx.textBaseline = "middle";
  particlesCtx.fillText(
    handGesture === "open" ? "✋" : "✊",
    handPosition.x,
    handPosition.y,
  );
}

// Set up control sliders
function setupControls() {
  // Particle count slider
  const countSlider = document.getElementById("particleCount");
  const countValue = document.getElementById("countValue");

  countSlider.addEventListener("input", function () {
    config.particleCount = parseInt(this.value);
    countValue.textContent = config.particleCount;
    initializeParticles();
  });

  // Particle size slider
  const sizeSlider = document.getElementById("particleSize");
  const sizeValue = document.getElementById("sizeValue");

  sizeSlider.addEventListener("input", function () {
    config.particleSize = parseFloat(this.value);
    sizeValue.textContent = config.particleSize;

    // Update existing particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].originalSize = Math.random() * config.particleSize + 1;
    }
  });

  // Attraction strength slider
  const strengthSlider = document.getElementById("attractionStrength");
  const strengthValue = document.getElementById("strengthValue");

  strengthSlider.addEventListener("input", function () {
    config.attractionStrength = parseFloat(this.value);
    strengthValue.textContent = config.attractionStrength;
  });

  // Color mode slider
  const colorSlider = document.getElementById("colorMode");
  const colorValue = document.getElementById("colorValue");

  const colorModes = ["Rainbow", "Fire", "Ice", "Neon"];

  colorSlider.addEventListener("input", function () {
    config.colorMode = parseInt(this.value);
    colorValue.textContent = colorModes[config.colorMode];

    // Update particle colors
    for (let i = 0; i < particles.length; i++) {
      particles[i].color = getParticleColor(i);
    }
  });
}
