(() => {
  const menu = document.querySelector(".mobile-menu");
  const openBtn = document.querySelector(".menu-open-btn");
  const closeBtn = document.querySelector(".menu-close-btn");

  const toggleMenu = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
  };

  openBtn.addEventListener("click", () => toggleMenu(true));
  closeBtn.addEventListener("click", () => toggleMenu(false));

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });
})();

window.addEventListener("load", () => {
  if (window.AOS) {
    window.AOS.init({ duration: 600, once: true });
  }
});
