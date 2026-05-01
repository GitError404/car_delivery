const cornerMenu = document.querySelector(".corner-menu");
const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const avatarPerson = document.querySelector(".avatar-person");
const carousel = document.querySelector(".services-carousel");
const carouselButtons = document.querySelectorAll("[data-carousel]");
const sliderDots = document.querySelectorAll(".slider-dot");
const flowSteps = document.querySelectorAll(".flow-step");
const flowDetail = document.querySelector(".flow-detail");
const flowProgress = document.querySelector(".flow-progress");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const spriteColumns = 5;
const spriteRows = 4;

const avatarFrames = {
  default: [0, 0],
  smile: [1, 2],
  nod: [2, 0],
  ok: [3, 3],
};

const avatarSequences = {
  wave: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 3],
    [0, 4],
    [0, 2],
    [0, 1],
    [0, 0],
  ],
  smile: [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ],
  nod: [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  ok: [
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
  ],
};

let avatarSequenceTimer;
let firstInteractionHandled = false;
let processInteractionHandled = false;

function setAvatarFrame(row, column) {
  if (!avatarPerson) return;
  const x = column * (100 / (spriteColumns - 1));
  const y = row * (100 / (spriteRows - 1));
  avatarPerson.style.backgroundPosition = `${x}% ${y}%`;
}

function stopAvatarSequence() {
  window.clearTimeout(avatarSequenceTimer);
}

function setAvatarState(state) {
  stopAvatarSequence();
  const [row, column] = avatarFrames[state] || avatarFrames.default;
  setAvatarFrame(row, column);
  if (avatarPerson) {
    avatarPerson.dataset.state = state;
  }
}

function playAvatarSequence(name, frameDuration = 150) {
  if (!avatarPerson) return;
  const frames = avatarSequences[name];
  if (!frames || !frames.length) {
    setAvatarState(name);
    return;
  }

  stopAvatarSequence();
  avatarPerson.classList.remove("is-changing", "is-emoting", "is-waving", "is-nodding");

  if (prefersReducedMotion) {
    setAvatarState("default");
    return;
  }

  let frameIndex = 0;
  const nextFrame = () => {
    const [row, column] = frames[frameIndex];
    setAvatarFrame(row, column);
    avatarPerson.dataset.state = name;
    frameIndex += 1;

    if (frameIndex < frames.length) {
      avatarSequenceTimer = window.setTimeout(nextFrame, frameDuration);
    } else {
      avatarPerson.dataset.state = "default";
    }
  };

  nextFrame();
}

function nodAvatarOnce() {
  if (firstInteractionHandled) return;
  firstInteractionHandled = true;
  playAvatarSequence("nod", 140);
}

window.addEventListener("load", () => {
  if (avatarPerson) {
    playAvatarSequence("wave", 120);
  }
});

document.addEventListener(
  "pointerdown",
  (event) => {
    if (event.target.closest("button, a, input, textarea, .services-carousel, .flow-step")) {
      nodAvatarOnce();
    }
  },
  { capture: true }
);

document.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  if (document.activeElement.closest("button, a, input, textarea, .services-carousel, .flow-step")) {
    nodAvatarOnce();
  }
});

function closeMenu() {
  if (!cornerMenu || !menuToggle) return;
  cornerMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (cornerMenu && menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    const isOpen = cornerMenu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!cornerMenu.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuToggle.focus();
    }
  });

  menuPanel.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });
}

function getSlides() {
  if (!carousel) return [];
  return [...carousel.querySelectorAll(".service-card")];
}

function getActiveSlideIndex() {
  const slides = getSlides();
  return slides.reduce((closestIndex, slide, index) => {
    const closestDistance = Math.abs(slides[closestIndex].offsetLeft - carousel.scrollLeft);
    const currentDistance = Math.abs(slide.offsetLeft - carousel.scrollLeft);
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);
}

function updateSliderDots() {
  const activeIndex = Math.max(0, Math.min(sliderDots.length - 1, getActiveSlideIndex()));
  sliderDots.forEach((dot, index) => {
    const isActive = index === activeIndex;
    dot.classList.toggle("is-active", isActive);
    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

function scrollToSlide(index) {
  const slides = getSlides();
  const targetSlide = slides[index];
  if (!targetSlide) return;

  carousel.scrollTo({
    left: targetSlide.offsetLeft,
    behavior: "smooth",
  });
}

carouselButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.carousel === "next" ? 1 : -1;
    const targetIndex = getActiveSlideIndex() + direction;
    scrollToSlide(Math.max(0, Math.min(sliderDots.length - 1, targetIndex)));
  });
});

sliderDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    scrollToSlide(Number(dot.dataset.slide));
  });
});

if (carousel) {
  carousel.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateSliderDots);
  });

  window.addEventListener("resize", updateSliderDots);
}

function activateStep(step) {
  if (!flowDetail) return;
  flowSteps.forEach((item) => {
    const isActive = item === step;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  if (flowProgress) {
    flowProgress.style.setProperty("--track-progress", step.dataset.stepProgress || "14%");
  }

  flowDetail.classList.add("is-changing");
  window.setTimeout(() => {
    flowDetail.querySelector("h3").textContent = step.dataset.stepTitle;
    flowDetail.querySelector("p").textContent = step.dataset.stepText;
    flowDetail.classList.remove("is-changing");
  }, 120);
}

function smileOnFirstProcessInteraction() {
  if (processInteractionHandled) return;
  processInteractionHandled = true;
  window.setTimeout(() => playAvatarSequence("smile", 150), firstInteractionHandled ? 0 : 900);
}

flowSteps.forEach((step) => {
  step.addEventListener("click", () => {
    activateStep(step);
    smileOnFirstProcessInteraction();
  });
  step.addEventListener("mouseenter", () => activateStep(step));
  step.addEventListener("focus", () => {
    activateStep(step);
    smileOnFirstProcessInteraction();
  });
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    formStatus.textContent = name
      ? `Дякуємо, ${name}. Скоро зв'яжемося з вами.`
      : "Дякуємо. Скоро зв'яжемося з вами.";
    playAvatarSequence("ok", 160);
    contactForm.reset();
  });
}
