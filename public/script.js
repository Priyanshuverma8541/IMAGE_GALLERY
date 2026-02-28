
const form = document.getElementById("uploadForm");
const container = document.getElementById("imageContainer");
const loading = document.getElementById("loading");

async function loadImages() {
  loading.style.display = "block";
  const res = await fetch("/api/images");
  const images = await res.json();
  loading.style.display = "none";

  container.innerHTML = "";
  images.forEach(img => {
    container.innerHTML += `
      <div class="image-card">
        <img src="${img.imageUrl}" alt="${img.title}" />
        <h3>${img.title}</h3>
      </div>
    `;
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  await fetch("/api/images", {
    method: "POST",
    body: formData
  });

  form.reset();
  loadImages();
});

loadImages();
