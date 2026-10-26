const themeToggle = document.querySelector(".theme-toggle");
const dialog = document.querySelector("#gameplay-dialog");
const video = dialog.querySelector("video");
const closeButton = dialog.querySelector(".close-dialog");
const errorMessage = document.querySelector("#video-error");

function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
}

themeToggle.addEventListener("click", () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  updateThemeLabel();
});
updateThemeLabel();

document.querySelectorAll("[data-watch]").forEach((button) => {
  button.addEventListener("click", () => {
    dialog.showModal();
    video.load();
    closeButton.focus();
  });
});

closeButton.addEventListener("click", () => dialog.close());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog.open) {
    dialog.close();
  }
});
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  ) {
    dialog.close();
  }
});
dialog.addEventListener("close", () => video.pause());
video.addEventListener("error", () => {
  errorMessage.hidden = false;
});
video.querySelector("source").addEventListener("error", () => {
  errorMessage.hidden = false;
});

/* Scroll-triggered fade-in */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".fade-section").forEach((el) => observer.observe(el));

/* Particle canvas — floating cave dust and gem sparkles */
const canvas = document.getElementById("particle-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const isDark = () => document.documentElement.dataset.theme === "dark";

  function createParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        isGem: Math.random() < 0.15,
        gemHue: Math.random() * 60 + 160,
      });
    }
  }
  createParticles(80);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = isDark();
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y > canvas.height + 5) { p.y = -5; p.x = Math.random() * canvas.width; }
      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;

      if (p.isGem) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `hsla(${p.gemHue}, 80%, 70%, ${p.opacity * 0.6})`
          : `hsla(${p.gemHue}, 60%, 40%, ${p.opacity * 0.4})`;
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.shadowColor = dark
          ? `hsla(${p.gemHue}, 80%, 70%, 0.4)`
          : `hsla(${p.gemHue}, 60%, 40%, 0.3)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = dark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)";
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(255,255,255,${p.opacity * 0.3})`
          : `rgba(0,0,0,${p.opacity * 0.15})`;
        ctx.fill();
      }
    });
    animId = requestAnimationFrame(draw);
  }
  draw();

  /* Recreate particles on theme switch */
  const origToggle = themeToggle.click;
  themeToggle.addEventListener("click", () => {
    setTimeout(() => {
      cancelAnimationFrame(animId);
      createParticles(80);
      draw();
    }, 50);
  }, true);
}
