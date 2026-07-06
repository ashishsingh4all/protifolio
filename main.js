// =====================================================
// LOADER → SKELETON → MAIN SITE SEQUENCE
// =====================================================
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const skeleton = document.getElementById("skeleton");
  const mainSite = document.getElementById("main-site");

  // Show loader for 1.2s
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      loader.style.display = "none";
      // Show skeleton
      skeleton.style.display = "flex";
      skeleton.style.opacity = "0";
      skeleton.style.transition = "opacity 0.4s ease";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          skeleton.style.opacity = "1";
        });
      });
      // Skeleton for 3.5s
      setTimeout(() => {
        skeleton.style.opacity = "0";
        setTimeout(() => {
          skeleton.style.display = "none";
          // Show main site
          mainSite.style.display = "block";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              mainSite.classList.add("visible");
              initSite();
            });
          });
        }, 500);
      }, 3500);
    }, 500);
  }, 1200);
});

function initSite() {
  initSpaceParticles();
  initCursor();
  initTrailParticles();
  initTypewriter();
  initMarquee();
  initScrollReveal();
  init3DTilt();
  initHero3DParallax();
}

// =====================================================
// 1. SPACE PARTICLE BACKGROUND (BLACK + WHITE STARS)
// =====================================================
function initSpaceParticles() {
  const canvas = document.getElementById("spaceCanvas");
  const ctx = canvas.getContext("2d");
  let W, H;

  const STAR_COUNT = 280;
  const NEBULA_COUNT = 5;
  const stars = [];
  const nebulas = [];
  let mouse = { x: W / 2, y: H / 2 };

  class Star {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : -2;
      this.z = Math.random() * W;
      this.pz = this.z;
      this.baseSize = Math.random() * 1.8 + 0.3;
      this.size = this.baseSize;
      this.speed = Math.random() * 0.15 + 0.02;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.02 + Math.random() * 0.03;
      // Occasional colored stars (very subtle)
      const r = Math.random();
      if (r < 0.03)
        this.color = "rgba(255,150,200,"; // pink
      else if (r < 0.06)
        this.color = "rgba(150,180,255,"; // blue
      else if (r < 0.08)
        this.color = "rgba(200,255,220,"; // green
      else this.color = "rgba(255,255,255,";
    }
    update() {
      this.twinkle += this.twinkleSpeed;
      this.y += this.speed;
      // Subtle drift toward mouse
      this.x += (mouse.x - W / 2) * 0.00008;
      if (this.y > H + 5) this.reset(false);
    }
    draw() {
      const twinkleOpacity =
        this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
      const grd = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.size * 3,
      );
      grd.addColorStop(0, this.color + twinkleOpacity + ")");
      grd.addColorStop(0.4, this.color + twinkleOpacity * 0.4 + ")");
      grd.addColorStop(1, this.color + "0)");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      // Solid core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color + twinkleOpacity + ")";
      ctx.fill();
    }
  }

  // Shooting stars
  const shootingStars = [];
  class ShootingStar {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H * 0.4;
      this.len = 80 + Math.random() * 120;
      this.speed = 8 + Math.random() * 8;
      this.alpha = 0;
      this.maxAlpha = 0.6 + Math.random() * 0.4;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
      this.life = 0;
      this.maxLife = 60 + Math.random() * 40;
      this.active = false;
      this.timer = Math.random() * 400;
    }
    update() {
      if (!this.active) {
        this.timer--;
        if (this.timer <= 0) this.active = true;
        return;
      }
      this.life++;
      if (this.life < 15) this.alpha = (this.life / 15) * this.maxAlpha;
      else if (this.life > this.maxLife - 15)
        this.alpha = ((this.maxLife - this.life) / 15) * this.maxAlpha;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      if (this.life >= this.maxLife) this.reset();
    }
    draw() {
      if (!this.active || this.alpha <= 0) return;
      ctx.save();
      const grd = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x - Math.cos(this.angle) * this.len,
        this.y - Math.sin(this.angle) * this.len,
      );
      grd.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      grd.addColorStop(0.3, `rgba(200,220,255,${this.alpha * 0.5})`);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.len,
        this.y - Math.sin(this.angle) * this.len,
      );
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(200,220,255,0.5)";
      ctx.stroke();
      ctx.restore();
    }
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    mouse = { x: W / 2, y: H / 2 };
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
  for (let i = 0; i < 4; i++) shootingStars.push(new ShootingStar());

  function drawDeepSpaceBg() {
    // Deep black with very subtle blue tint
    const grd = ctx.createRadialGradient(
      W * 0.3,
      H * 0.2,
      0,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.9,
    );
    grd.addColorStop(0, "rgba(8,5,18,1)");
    grd.addColorStop(0.5, "rgba(3,2,10,1)");
    grd.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    // Subtle nebula glow
    const neb1 = ctx.createRadialGradient(
      W * 0.15,
      H * 0.25,
      0,
      W * 0.15,
      H * 0.25,
      W * 0.35,
    );
    neb1.addColorStop(0, "rgba(123,97,255,0.04)");
    neb1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, W, H);
    const neb2 = ctx.createRadialGradient(
      W * 0.85,
      H * 0.75,
      0,
      W * 0.85,
      H * 0.75,
      W * 0.35,
    );
    neb2.addColorStop(0, "rgba(255,77,143,0.04)");
    neb2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, W, H);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawDeepSpaceBg();
    stars.forEach((s) => {
      s.update();
      s.draw();
    });
    shootingStars.forEach((s) => {
      s.update();
      s.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// =====================================================
// 2. CURSOR
// =====================================================
function initCursor() {
  const dot = document.getElementById("cursorDot");
  const outline = document.getElementById("cursorOutline");
  let mx = 0,
    my = 0,
    ox = 0,
    oy = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate3d(${mx - 4}px,${my - 4}px,0)`;
  });

  function smooth() {
    ox += (mx - ox) * 0.18;
    oy += (my - oy) * 0.18;
    outline.style.transform = `translate3d(${ox - 20}px,${oy - 20}px,0)`;
    requestAnimationFrame(smooth);
  }
  smooth();

  document
    .querySelectorAll("a,button,.btn,.project-card,.skill-tag,.social-icon")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        outline.classList.add("hover");
        dot.style.background = "#00e5ff";
      });
      el.addEventListener("mouseleave", () => {
        outline.classList.remove("hover");
        dot.style.background = "#ff4d8f";
      });
    });
}

// =====================================================
// 3. MOUSE TRAIL PARTICLES
// =====================================================
function initTrailParticles() {
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas.getContext("2d");
  let W = window.innerWidth,
    H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const particles = [];
  const COLORS = ["#ff4d8f", "#7b61ff", "#00e5ff", "#ffdb8e", "#ff80b5"];

  class P {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 5 + 2;
      this.alpha = 0.9;
      this.decay = 0.016 + Math.random() * 0.02;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.alpha -= this.decay;
      this.size *= 0.97;
      this.x += this.vx;
      this.y += this.vy;
      return this.alpha > 0;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  let last = 0;
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - last > 12) {
      for (let i = 0; i < 2; i++)
        particles.push(
          new P(
            e.clientX + (Math.random() - 0.5) * 8,
            e.clientY + (Math.random() - 0.5) * 8,
          ),
        );
      last = now;
    }
  });
  document.addEventListener("click", (e) => {
    for (let i = 0; i < 18; i++)
      particles.push(
        new P(
          e.clientX + (Math.random() - 0.5) * 25,
          e.clientY + (Math.random() - 0.5) * 25,
        ),
      );
  });

  function anim() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update()) particles.splice(i, 1);
      else particles[i].draw();
    }
    requestAnimationFrame(anim);
  }
  anim();
}

// =====================================================
// 4. INFINITE TYPEWRITER (loops forever)
// =====================================================
function initTypewriter() {
  const el = document.getElementById("animatedName");
  const phrases = [
    "hii, im ashish",
    "frontend Developer",
    "learing Backend",
    "ui sorcerer",
    "creative coder",
  ];
  let phraseIdx = 0,
    charIdx = 0,
    deleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 1800); // pause at full text
        return;
      }
      setTimeout(tick, 100);
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 350); // pause before next
        return;
      }
      setTimeout(tick, 55);
    }
  }
  tick();
}

// =====================================================
// 5. MARQUEE TEXT (infinite repeat)
// =====================================================
function initMarquee() {
  const track = document.getElementById("marqueeTrack");
  const items = [
    "<span>React.js</span>",
    "✦",
    "Three.js",
    "✦",
    "<span>WebGL</span>",
    "✦",
    "Framer Motion",
    "✦",
    "<span>GSAP</span>",
    "✦",
    "UI/UX Magic",
    "✦",
    "<span>Node.js</span>",
    "✦",
    "Tailwind CSS",
    "✦",
    "<span>Anime Dev</span>",
    "✦",
    "Next.js",
    "✦",
    "<span>TypeScript</span>",
    "✦",
    "Creative Code",
    "✦",
  ];
  const html = items
    .map((i) => `<span class="marquee-item">${i}</span>`)
    .join("");
  // Duplicate enough times so scroll is truly seamless
  track.innerHTML = html.repeat(4);
}

// =====================================================
// 6. SCROLL REVEAL
// =====================================================
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  function check() {
    const wH = window.innerHeight;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < wH - 80) el.classList.add("active");
    });
  }
  window.addEventListener("scroll", check, { passive: true });
  check();
}

// =====================================================
// 7. 3D CARD TILT
// =====================================================
function init3DTilt() {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const scene = card.closest(".card-scene");
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg) translateZ(18px) scale(1.03)`;
      card.style.transition = "transform 0.08s ease";
      // Dynamic light spot
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${px}px ${py}px, rgba(123,97,255,0.25), rgba(12,12,20,0.9))`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)";
      card.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
      card.style.background = "";
    });
  });
}

// =====================================================
// 8. HERO 3D PARALLAX (mouse moves = title tilts)
// =====================================================
function initHero3DParallax() {
  const title = document.getElementById("heroTitle3d");
  window.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2,
      cy = window.innerHeight / 2;
    const rx = ((e.clientY - cy) / cy) * 8;
    const ry = ((e.clientX - cx) / cx) * 12;
    title.style.transform = `rotateX(${-rx}deg) rotateY(${ry}deg) translateZ(0)`;
    title.style.transition = "transform 0.15s ease-out";
    // Parallax orbs
    document.querySelectorAll(".orb3d").forEach((orb, i) => {
      const fac = (i + 1) * 0.015;
      orb.style.transform = `translate(${(e.clientX - cx) * fac}px,${(e.clientY - cy) * fac}px)`;
    });
  });
}

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = a.getAttribute("href");
    if (t === "#") return;
    const el = document.querySelector(t);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
