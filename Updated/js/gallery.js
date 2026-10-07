// Sample data grouped by categories
const galleryData = {
    nature: [
        { url: "https://picsum.photos/id/10/800/450", title: "Forest Stream" },
        { url: "https://picsum.photos/id/15/800/450", title: "Water Waterfall" },
        { url: "https://picsum.photos/id/29/800/450", title: "Misty Mountains" },
        { url: "https://picsum.photos/id/54/800/450", title: "Green Valley" }
    ],
    architecture: [
        { url: "https://picsum.photos/id/122/800/450", title: "Modern Building" },
        { url: "https://picsum.photos/id/142/800/450", title: "Classic Architecture" },
        { url: "https://picsum.photos/id/160/800/450", title: "City Bridge" }
    ],
    travel: [
        { url: "https://picsum.photos/id/237/800/450", title: "Puppy on Trip" },
        { url: "https://picsum.photos/id/249/800/450", title: "Roadtrip View" },
        { url: "https://picsum.photos/id/250/800/450", title: "Camera & Map" },
        { url: "https://picsum.photos/id/274/800/450", title: "Sunny Beach" }
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
    currentCategory = categoryKey;
    currentIndex = 0;
    updateDisplay();
}

// Update Main Image and Filmstrip Thumbnails
function updateDisplay() {
    const images = galleryData[currentCategory];
    const currentItem = images[currentIndex];

    // Update main viewer
    mainImage.src = currentItem.url;
    imageTitle.textContent = currentItem.title;

    // Render thumbnails
    thumbnailStrip.innerHTML = "";
    images.forEach((imgObj, index) => {
        const thumb = document.createElement("img");
        thumb.src = imgObj.url;
        thumb.alt = imgObj.title;
        if (index === currentIndex) {
            thumb.classList.add("active");
        }
        thumb.addEventListener("click", () => {
            currentIndex = index;
            updateDisplay();
        });
        thumbnailStrip.appendChild(thumb);
    });
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