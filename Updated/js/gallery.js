// =============================================================
// PROJECTS GALLERY
// To add or change projects, edit galleryData only.
//   label    -> text shown in the dropdown
//   subtitle -> the "FEATURED PROJECTS: ..." line under the title
//   images   -> url = photo path, caption = text under the big photo
// The dropdown, slides and thumbnails are built from this automatically.
// =============================================================
const galleryData = {
    aster: {
        label: "Residential renovation & interior fit-out — San Juan City",
        subtitle: "Featured Projects: Aster Residences, San Juan City",
        // Stand-in photos: replace with the real Aster Residences photos
        images: [
            { url: "../images/day-house-img-header 3.png", caption: "Refined interiors with a fresh, contemporary feel." },
            { url: "../images/image 59.png", caption: "Clean lines and open spaces built for modern living." },
            { url: "../images/image 60.png", caption: "Warm materials that make a house feel like home." },
            { url: "../images/Residential.jpg", caption: "Solid structure, built right from the ground up." }
        ]
    }
};

// ---- Slide look: size of each position from the center ----
// All the same size (1) so the photos line up top and bottom.
// position 0 = center photo, 1 = the half-shown side photos, 2 = waiting off-screen
const SCALES = [1, 1, 1];
const GAP = 12;          // px between slides
const MIN_SLIDES = 5;    // repeat photos if needed so both sides are always filled

let currentCategory = Object.keys(galleryData)[0];
let currentIndex = 0;    // which photo is in the center (0..photos-1)
let slides = [];         // the <img> slides (photos may be repeated)
let slideOffsets = [];   // last position of each slide (-2..+2, etc.)
let activeSlide = 0;     // which slide is in the center

// DOM Elements
const categorySelect = document.getElementById("category-select");
const projectSubtitle = document.getElementById("project-subtitle");
const track = document.getElementById("slide-track");
const imageTitle = document.getElementById("image-title");
const thumbnailStrip = document.getElementById("thumbnail-strip");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function images() {
    return galleryData[currentCategory].images;
}

// Build the dropdown from galleryData
function buildDropdown() {
    categorySelect.innerHTML = "";
    Object.entries(galleryData).forEach(([key, project]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = project.label;
        categorySelect.appendChild(option);
    });
    categorySelect.value = currentCategory;
}

// Load a specific project
function loadCategory(categoryKey) {
    const project = galleryData[categoryKey];
    if (!project || !project.images || project.images.length === 0) {
        console.warn("gallery.js: no photos for project \"" + categoryKey + "\"");
        return;
    }
    currentCategory = categoryKey;
    currentIndex = 0;
    activeSlide = 0;
    projectSubtitle.textContent = project.subtitle || "";
    buildSlides();
    buildThumbnails();
    render(0, false);
}

// Create the square slides. With few photos the list is repeated,
// so there are always photos on both sides of the center one.
function buildSlides() {
    slides.forEach((s) => s.remove());
    slides = [];
    const list = images();
    const single = list.length < 2;
    let count = list.length;
    while (!single && count < MIN_SLIDES) count += list.length;

    for (let i = 0; i < count; i++) {
        const item = list[i % list.length];
        const img = document.createElement("img");
        img.className = "slide";
        img.src = item.url;
        img.alt = "";
        img.draggable = false;
        img.addEventListener("click", () => {
            const offset = slideOffsets[i];
            if (offset) step(offset);
        });
        track.insertBefore(img, prevBtn);
        slides.push(img);
    }
    slideOffsets = slides.map(() => 0);
    prevBtn.hidden = single;
    nextBtn.hidden = single;
}

// Where each position sits, measured from the center (in px)
function positionX(offset, size) {
    const dir = Math.sign(offset);
    let x = 0;
    for (let k = 1; k <= Math.abs(offset); k++) {
        const prev = SCALES[Math.min(k - 1, SCALES.length - 1)];
        const cur = SCALES[Math.min(k, SCALES.length - 1)];
        x += (prev * size) / 2 + GAP + (cur * size) / 2;
    }
    return dir * x;
}

function placeSlide(img, offset, size) {
    const abs = Math.abs(offset);
    const scale = SCALES[Math.min(abs, SCALES.length - 1)];
    const x = positionX(offset, size);
    img.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
    img.style.zIndex = String(10 - abs);
    // Slides further out than the edge ones are hidden
    img.style.opacity = abs > SCALES.length - 1 ? "0" : "1";
    img.classList.toggle("is-active", offset === 0);
    img.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    img.alt = offset === 0 ? images()[currentIndex].caption : "";
}

// Move all slides to their new positions.
// direction: +1 = moved right/next, -1 = moved left/prev, 0 = no animation
function render(direction, animate = true) {
    const n = slides.length;
    if (n === 0) return;
    const size = slides[0].offsetWidth;
    const half = Math.floor(n / 2);

    slides.forEach((img, i) => {
        // Position relative to the center slide, wrapped so it loops forever
        let offset = (((i - activeSlide) % n) + n) % n;
        if (offset > half) offset -= n;

        const old = slideOffsets[i];
        const edge = SCALES.length - 1;              // last visible position
        const isWrap = Math.abs(offset - old) > half; // looped to the other end
        const bothHidden = Math.abs(old) > edge && Math.abs(offset) > edge;

        if (!animate || (isWrap && bothHidden)) {
            // No animation needed (first load, resize, or moving while hidden)
            img.classList.add("no-anim");
            placeSlide(img, offset, size);
        } else if (isWrap) {
            // A slide looping from one end to the other: put it just outside
            // the side it should come in from, then slide it in.
            const side = Math.sign(offset) || direction || 1;
            img.classList.add("no-anim");
            placeSlide(img, offset + side, size);
            img.getBoundingClientRect(); // apply that start position first
            img.classList.remove("no-anim");
            placeSlide(img, offset, size);
        } else {
            img.classList.remove("no-anim");
            placeSlide(img, offset, size);
        }
        slideOffsets[i] = offset;
    });

    if (!animate) {
        track.getBoundingClientRect();
        slides.forEach((img) => img.classList.remove("no-anim"));
    }

    imageTitle.textContent = images()[currentIndex].caption;
    updateThumbnails();
}

function step(direction) {
    const count = images().length;
    if (count < 2) return;
    currentIndex = (currentIndex + direction + count) % count;
    activeSlide = (activeSlide + direction + slides.length) % slides.length;
    render(direction);
}

// Jump to a photo (from the thumbnails) by the shortest route
function goTo(index) {
    const count = images().length;
    let diff = index - currentIndex;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    if (diff === 0) return;
    currentIndex = index;
    activeSlide = (activeSlide + diff + slides.length) % slides.length;
    render(Math.sign(diff));
}

// ---- Thumbnails ----
function buildThumbnails() {
    thumbnailStrip.innerHTML = "";
    images().forEach((imgObj, index) => {
        // A button (not a bare img) so thumbnails also work with the keyboard
        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = "thumb-btn";
        thumb.setAttribute("aria-label", "Show photo " + (index + 1) + ": " + imgObj.caption);

        const img = document.createElement("img");
        img.src = imgObj.url;
        img.alt = "";
        img.loading = "lazy";
        thumb.appendChild(img);

        thumb.addEventListener("click", () => goTo(index));
        thumbnailStrip.appendChild(thumb);
    });
}

function updateThumbnails() {
    [...thumbnailStrip.children].forEach((thumb, index) => {
        const active = index === currentIndex;
        thumb.classList.toggle("active", active);
        if (active) thumb.setAttribute("aria-current", "true");
        else thumb.removeAttribute("aria-current");
    });
}

// ---- Controls ----
prevBtn.addEventListener("click", () => step(-1));
nextBtn.addEventListener("click", () => step(1));

// Keyboard arrows when the gallery has focus
track.tabIndex = 0;
track.setAttribute("aria-label", "Project photos. Use left and right arrow keys to browse.");
track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
});

// Swipe on phones and tablets
let touchStartX = null;
track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });
track.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchStartX = null;
});

// Dropdown
categorySelect.addEventListener("change", (e) => {
    loadCategory(e.target.value);
});

// Screen size changed: re-place slides without animating
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render(0, false), 100);
});

// Run on load
buildDropdown();
loadCategory(currentCategory);
