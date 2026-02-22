const form = document.getElementById("uploadForm");
const galleryImage = document.getElementById("galleryImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let images = [];
let currentIndex = 0;

// Fetch Images from Server
async function loadImages() {
    try {
        const res = await fetch("http://localhost:8080/api/images");
        images = await res.json();

        if (images.length > 0) {
            galleryImage.src = images[currentIndex].imageUrl;
        }
    } catch (err) {
        console.error("Error fetching images:", err);
    }
}

// Upload Image
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    await fetch("http://localhost:8080/api/images/upload", {
        method: "POST",
        body: formData
    });

    form.reset();
    await loadImages();
});

// Next Button
nextBtn.addEventListener("click", () => {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    galleryImage.src = images[currentIndex].imageUrl;
});

// Previous Button
prevBtn.addEventListener("click", () => {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    galleryImage.src = images[currentIndex].imageUrl;
});

loadImages();