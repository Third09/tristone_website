// Sample data grouped by categories
const galleryData = {
    nature: [
        { url: "../images/image 59.png", title: "Forest Stream" },
        { url: "https://picsum.photos/id/15/800/450", title: "Water Waterfall" },
        { url: "https://picsum.photos/id/29/800/450", title: "Misty Mountains" },
        { url: "https://picsum.photos/id/54/800/450", title: "Green Valley" }
    ]
};

let currentCategory = "nature";
let currentIndex = 0;

// DOM Elements
const categorySelect = document.getElementById("category-select");
const mainImage = document.getElementById("main-image");
const imageTitle = document.getElementById("image-title");
const thumbnailStrip = document.getElementById("thumbnail-strip");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Initialize Gallery
function initGallery() {
    loadCategory(currentCategory);
}

// Load a specific group/category
function loadCategory(categoryKey) {
    // Ignore dropdown options that have no photos in galleryData
    if (!galleryData[categoryKey] || galleryData[categoryKey].length === 0) {
        console.warn("gallery.js: no photos for group \"" + categoryKey + "\"");
        return;
    }
    currentCategory = categoryKey;
    currentIndex = 0;
    updateDisplay();
}

// Update Main Image and Filmstrip Thumbnails
function updateDisplay() {
    const images = galleryData[currentCategory];
    const currentItem = images[currentIndex];

    // Update main viewer (with a quick fade so the change feels smooth)
    if (mainImage.getAttribute("src") !== currentItem.url) {
        mainImage.src = currentItem.url;
        mainImage.alt = currentItem.title;
        mainImage.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
    }
    imageTitle.textContent = currentItem.title;

    // Render thumbnails (remember keyboard focus so it isn't lost on redraw)
    const hadFocus = thumbnailStrip.contains(document.activeElement);
    thumbnailStrip.innerHTML = "";
    images.forEach((imgObj, index) => {
        // A button (not a bare img) so thumbnails also work with the keyboard
        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = "thumb-btn";
        thumb.setAttribute("aria-label", "Show " + imgObj.title);

        const img = document.createElement("img");
        img.src = imgObj.url;
        img.alt = "";
        img.loading = "lazy";
        thumb.appendChild(img);

        if (index === currentIndex) {
            thumb.classList.add("active");
            thumb.setAttribute("aria-current", "true");
        }
        thumb.addEventListener("click", () => {
            currentIndex = index;
            updateDisplay();
        });
        thumbnailStrip.appendChild(thumb);
    });

    if (hadFocus) {
        thumbnailStrip.children[currentIndex].focus();
    }
}

// Event Listeners for Next / Prev buttons
prevBtn.addEventListener("click", () => {
    const images = galleryData[currentCategory];
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateDisplay();
});

nextBtn.addEventListener("click", () => {
    const images = galleryData[currentCategory];
    currentIndex = (currentIndex + 1) % images.length;
    updateDisplay();
});

// Event Listener for Dropdown Change
categorySelect.addEventListener("change", (e) => {
    loadCategory(e.target.value);
});

// Run on load
initGallery();