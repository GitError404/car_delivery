const cornerMenu = document.querySelector(".corner-menu");
const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const carousel = document.querySelector(".services-carousel");
const carouselButtons = document.querySelectorAll("[data-carousel]");
const flowSteps = document.querySelectorAll(".flow-step");
const flowDetail = document.querySelector(".flow-detail");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

function closeMenu() {
  cornerMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

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
  if (event.target.matches("a")) {
    closeMenu();
  }
});

carouselButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.carousel === "next" ? 1 : -1;
    const firstCard = carousel.querySelector(".service-card");
    const cardWidth = firstCard.getBoundingClientRect().width;
    carousel.scrollBy({
      left: direction * (cardWidth + 16),
      behavior: "smooth",
    });
  });
});

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
  step.addEventListener("click", () => activateStep(step));
  step.addEventListener("mouseenter", () => activateStep(step));
  step.addEventListener("focus", () => activateStep(step));
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  formStatus.textContent = name
    ? `Дякуємо, ${name}. Скоро зв'яжемося з вами.`
    : "Дякуємо. Скоро зв'яжемося з вами.";
  contactForm.reset();
});
