// This is browser JavaScript bundled by Astro, not executed when Astro builds the page.
const scenes = {
  brief: ["01 / THE BRIEF", "A VERY AMBITIOUS IDEA."],
  choice: ["02 / THE CHOICE", "PROGRESS OR EVIDENCE?"],
  idea: ["03 / THE INSIGHT", "FIND THE IMPORTANT UNCERTAINTY."],
  garden: ["04 / THE DETOUR", "MAYBE IT'S THE SLUGS. MAYBE."],
  lab: ["05 / THE PRACTICE", "A SMALL EXPERIMENT CAN GO FAR."]
};

const number = document.querySelector("#scene-number");
const caption = document.querySelector("#scene-caption");
const progress = document.querySelector("#progress-fill");
const steps = [...document.querySelectorAll("[data-scene]")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    const scene = active && scenes[active.target.dataset.scene];
    if (scene && number && caption) {
      number.textContent = scene[0];
      caption.textContent = scene[1];
    }
  }, { rootMargin: "-25% 0px -25% 0px", threshold: [0, 0.25, 0.5] });
  steps.forEach((step) => observer.observe(step));
}

let pending = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = (max > 0 ? Math.min(100, 100 * scrollY / max) : 100) + "%";
  pending = false;
}
window.addEventListener("scroll", () => {
  if (!pending) {
    requestAnimationFrame(updateProgress);
    pending = true;
  }
}, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
