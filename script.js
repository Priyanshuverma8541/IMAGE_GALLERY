const images = document.querySelectorAll(".gallery-container img");
let currentIndex = 0;

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");


images[currentIndex].classList.add("active");


const updateActiveImage = (index) => {
    images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
    });
};

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateActiveImage(currentIndex);
});


nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateActiveImage(currentIndex);
});
