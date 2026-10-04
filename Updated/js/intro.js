document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("intro-video");
  const image = document.getElementById("intro-image");
  const navHeader = document.querySelector("nav.site-header");
  const heroContent = document.querySelector(".hero-content");
  const skipBtn = document.getElementById("skip-btn");

  function finishIntro() {
    video.pause();
    video.style.display = "none";
    image.style.display = "block";
    skipBtn.style.display = "none";

    navHeader.classList.remove("nav-hidden");
    heroContent.classList.remove("hero-hidden");
    navHeader.classList.add("fixed-active");

    document.documentElement.classList.remove("lock-scroll");
  }

  video.addEventListener("ended", finishIntro);
  skipBtn.addEventListener("click", finishIntro);
});