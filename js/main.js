(() => {
  const menu = document.querySelector(".mobile-menu");
  const openBtn = document.querySelector(".menu-open-btn");
  const closeBtn = document.querySelector(".menu-close-btn");

  const toggleMenu = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
    openBtn.setAttribute("aria-expanded", String(isOpen));
  };

  openBtn.addEventListener("click", () => toggleMenu(true));
  closeBtn.addEventListener("click", () => toggleMenu(false));

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      toggleMenu(false);
    }
  });

  window
    .matchMedia("(min-width: 1440px)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        toggleMenu(false);
      }
    });
})();

window.addEventListener("load", () => {
  if (window.AOS) {
    window.AOS.init({ duration: 600, once: true });
  } else {
    document.querySelectorAll("[data-aos]").forEach((el) => {
      el.removeAttribute("data-aos");
    });
  }
});
