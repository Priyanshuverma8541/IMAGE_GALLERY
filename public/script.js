const form = document.getElementById("uploadForm");
const galleryImage = document.getElementById("galleryImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let images = [];
let currentIndex = 0;

// Fetch Images from Server
async function loadImages() {
    try {
        const res = await fetch("/api/images");

        if (!res.ok) {
            throw new Error("Failed to fetch images");
        }

        images = await res.json();

        if (images.length > 0) {
            galleryImage.src = images[currentIndex].imageUrl;
        } else {
            galleryImage.src = "";
        }

    } catch (err) {
        console.error("Error fetching images:", err);
    }
}

// Upload Image
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
        const res = await fetch("/api/images/upload", {   // ✅ FIXED HERE
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Upload failed");
        }

        form.reset();
        await loadImages();

    } catch (err) {
        console.error("Upload error:", err);
    }
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