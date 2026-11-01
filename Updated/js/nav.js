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

// =============================================================
// SMOOTH SCROLL for links to sections on the same page
// (Home, Services, Projects, About...). The page eases in,
// speeds up, then eases out as it arrives at the section.
// Links to another page (like contact.html) work as normal.
// =============================================================
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let animationId = null;

  // Ease in AND out: slow start, smooth middle, soft landing
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function stopScroll() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function smoothScrollTo(targetY) {
    stopScroll();
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    if (reduceMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    // Longer trips take a bit longer, but never feel slow
    const duration = Math.min(1100, 450 + Math.abs(distance) * 0.18);
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) {
        animationId = requestAnimationFrame(frame);
      } else {
        animationId = null;
      }
    }
    animationId = requestAnimationFrame(frame);
  }

  // If the visitor scrolls with the mouse wheel or finger mid-glide, let them take over
  ["wheel", "touchstart", "keydown"].forEach((evt) =>
    window.addEventListener(evt, stopScroll, { passive: true })
  );

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href*='#']");
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

    const url = new URL(link.href, window.location.href);
    // Only handle links to this same page
    if (url.pathname !== window.location.pathname || !url.hash) return;

    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    // Page is still locked during the intro video: do nothing special
    if (document.documentElement.classList.contains("lock-scroll")) return;

    e.preventDefault();
    const isTop = url.hash === "#index";
    const targetY = isTop ? 0 : target.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(targetY);

    // Keep the address bar in sync (so the link can be shared/bookmarked)
    if (window.location.hash !== url.hash) {
      history.pushState(null, "", url.hash);
    }
  });
})();
