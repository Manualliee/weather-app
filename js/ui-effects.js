window.addEventListener("scroll", () => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    if (window.scrollY > 200) {
        footer.classList.add("footer-visible");
    } else {
        footer.classList.remove("footer-visible");
    }
})