const form = document.getElementById("uploadForm");
const container = document.getElementById("imageContainer");
const loading = document.getElementById("loading");

function createModal(img) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>

      ${
        img.fileType === "image"
          ? `<img src="${img.imageUrl}" />`
          : `<iframe src="${img.imageUrl}" width="100%" height="400px"></iframe>`
      }

      <h3>${img.title}</h3>

      <a href="${img.imageUrl}" target="_blank">🔗 Open File</a>

      <button class="delete-btn">Delete</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector(".delete-btn").onclick = async () => {
    if (confirm("Delete this file?")) {
      await fetch(`/api/images?id=${img._id}`, {
        method: "DELETE"
      });
      modal.remove();
      loadImages();
    }
  };

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

async function loadImages() {
  loading.style.display = "block";

  const res = await fetch("/api/images");
  const images = await res.json();

  loading.style.display = "none";

  container.innerHTML = "";

  images.forEach(img => {
    const card = document.createElement("div");
    card.className = "image-card";

    card.innerHTML = `
      ${
        img.fileType === "image"
          ? `<img src="${img.imageUrl}" />`
          : `<div class="doc-card">📄 Document</div>`
      }
      <h3>${img.title}</h3>
    `;

    card.onclick = () => createModal(img);

    container.appendChild(card);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  loading.style.display = "block";

  await fetch("/api/images", {
    method: "POST",
    body: formData
  });

  form.reset();
  loadImages();
});

loadImages();