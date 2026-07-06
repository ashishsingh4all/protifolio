// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const parallax_el = document.querySelectorAll(".parallax");
  const main = document.querySelector("main");
  const header = document.querySelector("header");
  const hamburger = document.querySelector(".hamburger");
  const loadingScreen = document.querySelector(".loading-screen");
  const scrollIndicator = document.querySelector(".scroll-indicator");
  
  // Variables
  let xValue = 0, yValue = 0;
  let rotateDegree = 0;
  let lastScrollTop = 0;
  let rafId = null;
  
  // Hide loading screen
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 1000);
  }, 2000);

  // Optimized update function with requestAnimationFrame
  function update(cursorPosition) {
    if (rafId) cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
      parallax_el.forEach((el) => {
        let speedx = parseFloat(el.dataset.speedx) || 0;
        let speedy = parseFloat(el.dataset.speedy) || 0;
        let speedz = parseFloat(el.dataset.speedz) || 0;
        let rotateSpeed = parseFloat(el.dataset.rotation) || 0;

        let rect = el.getBoundingClientRect();
        let isInleft = rect.left < window.innerWidth / 2 ? 1 : -1;

        let zvalue = (cursorPosition - rect.left) * isInleft * 0.1;

        // Apply transform with optimized properties
        el.style.transform = `
          perspective(2300px)
          translateZ(${zvalue * speedz}px)
          rotateY(${rotateDegree * rotateSpeed}deg)
          translateX(calc(-50% + ${-xValue * speedx}px))
          translateY(calc(-50% + ${yValue * speedy}px))
        `;
      });
    });
  }

  // Throttled mouse move handler
  let mouseMoveTimeout;
  window.addEventListener("mousemove", (e) => {
    if (mouseMoveTimeout) return;
    
    mouseMoveTimeout = setTimeout(() => {
      if (window.timeline && timeline.isActive()) {
        mouseMoveTimeout = null;
        return;
      }

      xValue = e.clientX - window.innerWidth / 2;
      yValue = e.clientY - window.innerHeight / 2;
      rotateDegree = (xValue / (window.innerWidth / 2)) * 20;
      
      update(e.clientX);
      mouseMoveTimeout = null;
    }, 10);
  });

  // Scroll effects
  window.addEventListener("scroll", () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Hide/show header on scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      header.classList.add("hidden");
    } else {
      header.classList.remove("hidden");
    }
    lastScrollTop = scrollTop;
    
    // Parallax effect on scroll for content section
    let contentSection = document.querySelector(".content-section");
    if (contentSection) {
      let scrollProgress = scrollTop / (document.documentElement.scrollHeight - window.innerHeight);
      contentSection.style.transform = `translateY(${scrollProgress * 50}px)`;
    }
  });

  // Responsive height adjustment
  function adjustMainHeight() {
    if (window.innerWidth >= 725) {
      main.style.maxHeight = `${window.innerWidth * 0.6}px`;
    } else {
      main.style.maxHeight = `${window.innerWidth * 1.6}px`;
    }
  }
  
  adjustMainHeight();
  window.addEventListener("resize", adjustMainHeight);

  // GSAP Animation
  let timeline = gsap.timeline({
    onComplete: () => {
      // Enable mouse effects after animation
      document.body.style.cursor = 'auto';
    }
  });

  // Initial animation
  Array.from(parallax_el)
    .filter((el) => !el.classList.contains("text"))
    .forEach((el) => {
      timeline.from(
        el,
        {
          top: `${el.offsetHeight / 2 + parseFloat(el.dataset.distance || 0)}px`,
          duration: 3.5,
          ease: "power3.out",
        },
        "1"
      );
    });

  // Text animations
  timeline
    .from(
      ".text h1",
      {
        y: window.innerHeight - document.querySelector(".text h1").getBoundingClientRect().top + 200,
        duration: 2,
        ease: "power3.out",
      },
      "2.5"
    )
    .from(
      ".text h2",
      {
        y: -150,
        opacity: 0,
        duration: 1.5,
        ease: "back.out(1.7)",
      },
      "3"
    )
    .from(
      ".hide",
      {
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
      },
      "3"
    )
    .from(
      ".scroll-indicator",
      {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      },
      "3.5"
    );

  // Hamburger menu toggle
  hamburger.addEventListener("click", (e) => {
    e.preventDefault();
    hamburger.classList.toggle("active");
    // Add menu functionality here
  });

  // Smooth scroll to content
  scrollIndicator.addEventListener("click", () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  });

  // Performance: Disable parallax on mobile if needed
  if (window.innerWidth <= 768) {
    // Optionally disable complex transforms on mobile
    parallax_el.forEach(el => {
      el.style.transition = 'none';
    });
  }
});