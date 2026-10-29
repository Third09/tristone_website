// Mobile menu: the burger button opens/closes the nav links on tablets and phones.
// On desktop the burger is hidden by CSS, so none of this is visible there.
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav.site-header");
  const burger = nav && nav.querySelector(".nav-burger");
  const links = document.getElementById("nav-links");
  if (!nav || !burger || !links) return;

  function setOpen(open) {
    nav.classList.toggle("nav-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  burger.addEventListener("click", () => {
    setOpen(!nav.classList.contains("nav-open"));
  });

  // Close after picking a link (same-page links like #services don't reload)
  links.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setOpen(false))
  );

  // Close when tapping outside the nav or pressing Escape
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("nav-open")) {
      setOpen(false);
      burger.focus();
    }
  });

  // Rotating a tablet to desktop width: reset the menu
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
});
