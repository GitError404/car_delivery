const cornerMenu = document.querySelector(".corner-menu");
const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const avatarPerson = document.querySelector(".avatar-person");
const carousel = document.querySelector(".services-carousel");
const carouselButtons = document.querySelectorAll("[data-carousel]");
const sliderDots = document.querySelectorAll(".slider-dot");
const flowSteps = document.querySelectorAll(".flow-step");
const flowDetail = document.querySelector(".flow-detail");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const avatarStates = {
  default: "assets/avatar/avatar-default.png",
  smile: "assets/avatar/avatar-smile.png",
  wave: "assets/avatar/avatar-wave.png",
  thumbsUp: "assets/avatar/avatar-thumbs-up.png",
  ok: "assets/avatar/avatar-ok.png",
};

let avatarTimer;

Object.values(avatarStates).forEach((src) => {
  const image = new Image();
  image.src = src;
});

function setAvatarState(state, duration = 1800) {
  const nextSrc = avatarStates[state] || avatarStates.default;
  window.clearTimeout(avatarTimer);

  avatarPerson.classList.remove("is-emoting", "is-waving");
  avatarPerson.classList.add("is-changing");

  window.setTimeout(() => {
    avatarPerson.src = nextSrc;
    avatarPerson.dataset.state = state;
    avatarPerson.classList.remove("is-changing");

    if (!prefersReducedMotion && state !== "default") {
      avatarPerson.classList.add(state === "wave" ? "is-waving" : "is-emoting");
    }
  }, 130);

  if (state !== "default" && duration > 0) {
    avatarTimer = window.setTimeout(() => {
      setAvatarState("default", 0);
    }, duration);
  }
}

function closeMenu() {
  cornerMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = cornerMenu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  setAvatarState(isOpen ? "smile" : "default", isOpen ? 1400 : 0);
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
  if (event.target.matches("a")) {
    closeMenu();
  }
});

function getSlideDistance() {
  const firstCard = carousel.querySelector(".service-card");
  const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function getSlides() {
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
    setAvatarState("ok", 1300);
  });
});

sliderDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    scrollToSlide(Number(dot.dataset.slide));
    setAvatarState("smile", 1300);
  });
});

carousel.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateSliderDots);
});

window.addEventListener("resize", updateSliderDots);

function activateStep(step) {
  flowSteps.forEach((item) => {
    const isActive = item === step;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  flowDetail.classList.add("is-changing");
  window.setTimeout(() => {
    flowDetail.querySelector("h3").textContent = step.dataset.stepTitle;
    flowDetail.querySelector("p").textContent = step.dataset.stepText;
    flowDetail.classList.remove("is-changing");
  }, 120);
}

flowSteps.forEach((step) => {
  step.addEventListener("click", () => {
    activateStep(step);
    setAvatarState("ok", 1400);
  });
  step.addEventListener("mouseenter", () => activateStep(step));
  step.addEventListener("focus", () => {
    activateStep(step);
    setAvatarState("smile", 1200);
  });
});

document.querySelectorAll(".hero-actions a, .messenger-links a, .sticky-cta").forEach((link) => {
  link.addEventListener("click", () => {
    setAvatarState(link.matches(".messenger-links a") ? "thumbsUp" : "wave", 1700);
  });
});

const reactedSections = new Set();
const sectionAvatarStates = {
  services: "wave",
  process: "ok",
  options: "smile",
  contact: "thumbsUp",
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || reactedSections.has(entry.target.id)) return;
      reactedSections.add(entry.target.id);
      setAvatarState(sectionAvatarStates[entry.target.id], 1500);
    });
  },
  { threshold: 0.42 }
);

Object.keys(sectionAvatarStates).forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  formStatus.textContent = name
    ? `Дякуємо, ${name}. Скоро зв'яжемося з вами.`
    : "Дякуємо. Скоро зв'яжемося з вами.";
  setAvatarState("thumbsUp", 3200);
  contactForm.reset();
});
