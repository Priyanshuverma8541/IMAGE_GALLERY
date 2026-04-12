const form = document.getElementById("uploadForm");
const container = document.getElementById("imageContainer");
const loading = document.getElementById("loading");

let allFiles = [];

function isImage(file) {
  return file.fileType === "image" || !file.fileType;
}

function createModal(file) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>

      ${
        isImage(file)
          ? `<img src="${file.imageUrl}" />`
          : `<iframe src="${file.imageUrl}"></iframe>`
      }

      <h3>${file.title}</h3>

      <div class="actions">
        <a href="${file.imageUrl}" target="_blank">
          <button class="open">Open</button>
        </a>

        <button class="delete">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector(".delete").onclick = async () => {
    if (confirm("Delete this file?")) {
      await fetch(`/api/images?id=${file._id}`, { method: "DELETE" });
      modal.remove();
      loadFiles();
    }
  };

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

function render(files) {
  container.innerHTML = "";

  files.forEach(file => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${
        isImage(file)
          ? `<img src="${file.imageUrl}" />`
          : `<div class="doc-card">📄</div>`
      }
      <h3>${file.title}</h3>
    `;

    card.onclick = () => createModal(file);

    container.appendChild(card);
  });
}

async function loadFiles() {
  loading.style.display = "block";

  const res = await fetch("/api/images");
  allFiles = await res.json();

  loading.style.display = "none";

  render(allFiles);
}

function filterFiles(type) {
  if (type === "all") return render(allFiles);

  if (type === "image") {
    render(allFiles.filter(f => isImage(f)));
  }

  if (type === "doc") {
    render(allFiles.filter(f => !isImage(f)));
  }
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
  loadFiles();
});

loadFiles();