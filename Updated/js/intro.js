document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("intro-video");
  const image = document.getElementById("intro-image");
  const navHeader = document.querySelector("nav.site-header");
  const heroContent = document.querySelector(".hero-content");
  const skipBtn = document.getElementById("skip-btn");

  // Remembers that the intro already played in this browser tab.
  // sessionStorage clears when the tab is closed, so a new visit plays it again.
  const INTRO_SEEN_KEY = "tristoneIntroSeen";

  function hasSeenIntro() {
    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch (e) {
      return false; // storage blocked (e.g. some private modes): just play the intro
    }
  }

  function markIntroSeen() {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch (e) {
      /* storage blocked: nothing to remember */
    }
  }

  // Prevent browser from restoring old scroll position on refresh
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Always jump back to the top of the page before unloading/reloading
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });

  function finishIntro() {
    video.pause();
    video.style.display = "none";
    image.style.display = "block";
    skipBtn.style.display = "none";

    navHeader.classList.remove("nav-hidden");
    heroContent.classList.remove("hero-hidden");
    navHeader.classList.add("fixed-active");

    // Unlock page scrolling on the html root
    document.documentElement.classList.remove("lock-scroll");

    markIntroSeen();
  }

  // Skip the intro if it already played this session, or if the visitor came
  // from another page's nav link (e.g. contact.html -> index.html#services)
  if (hasSeenIntro() || window.location.hash) {
    // Stop the video from downloading/playing in the background
    video.removeAttribute("autoplay");
    video.querySelectorAll("source").forEach((source) => source.remove());
    video.load();

    finishIntro();

    // Jump to the section named in the link (#services, #projects, ...)
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        target.scrollIntoView();
      }
    }
    return;
  }

  video.addEventListener("ended", finishIntro);
  skipBtn.addEventListener("click", finishIntro);
});
