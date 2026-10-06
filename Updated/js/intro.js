document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("intro-video");
  const image = document.getElementById("intro-image");
  const navHeader = document.querySelector("nav.site-header");
  const heroContent = document.querySelector(".hero-content");
  const skipBtn = document.getElementById("skip-btn");

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
  }

  video.addEventListener("ended", finishIntro);
  skipBtn.addEventListener("click", finishIntro);
});