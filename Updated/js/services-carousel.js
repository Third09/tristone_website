// Services cards carousel:
// the right arrow slides all the way to the last card in one smooth move,
// the left arrow slides all the way back to the first card.
// Arrows hide themselves at the start/end.
//
// How the smooth slide works:
// 1. Jump the scroll position to the end instantly (nobody sees this frame).
// 2. Shift the cards back to where they were with a transform.
// 3. Animate that transform to 0, so the cards glide into place.
// Transforms are run by the graphics card, so the motion stays seamless
// instead of stepping pixel by pixel like a scroll animation.
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("cards-track");
  const prevBtn = document.getElementById("cards-prev");
  const nextBtn = document.getElementById("cards-next");
  if (!track || !prevBtn || !nextBtn) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = 800; // ms
  const EASING = "cubic-bezier(0.65, 0, 0.35, 1)"; // slow start, fast middle, soft landing
  let running = [];

  function stopAnimations() {
    running.forEach((anim) => anim.finish());
    running = [];
    updateArrows();
  }

  function slideTo(target) {
    stopAnimations();

    const start = track.scrollLeft;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;

    // Set the arrows for where we're going now. While the cards are shifted
    // the strip looks wider than it really is, so don't measure mid-slide.
    const max = maxScroll();
    prevBtn.hidden = target <= 2;
    nextBtn.hidden = target >= max - 2;

    track.scrollLeft = target;
    if (reduceMotion) return;

    running = [...track.querySelectorAll(".card")].map((card) =>
      card.animate(
        [
          { transform: `translateX(${distance}px)` },
          { transform: "translateX(0)" },
        ],
        { duration: DURATION, easing: EASING }
      )
    );

    const thisSlide = running;
    thisSlide[thisSlide.length - 1].finished.then(() => {
      if (running !== thisSlide) return; // a newer slide already started
      running = [];
      updateArrows();
    }).catch(() => {});
  }

  function maxScroll() {
    return track.scrollWidth - track.clientWidth;
  }

  // Show/hide arrows depending on where we are (2px wiggle room for rounding)
  function updateArrows() {
    prevBtn.hidden = track.scrollLeft <= 2;
    nextBtn.hidden = track.scrollLeft >= maxScroll() - 2;
  }

  nextBtn.addEventListener("click", () => slideTo(maxScroll()));
  prevBtn.addEventListener("click", () => slideTo(0));

  // If the user swipes/scrolls the cards themselves, end the slide right away
  ["wheel", "touchstart"].forEach((evt) =>
    track.addEventListener(evt, stopAnimations, { passive: true })
  );

  let ticking = false;
  track.addEventListener("scroll", () => {
    if (ticking || running.length) return; // skip while the slide is playing
    ticking = true;
    requestAnimationFrame(() => {
      updateArrows();
      ticking = false;
    });
  });

  window.addEventListener("resize", updateArrows);
  window.addEventListener("load", updateArrows); // after images load, widths are final
  updateArrows();
});
