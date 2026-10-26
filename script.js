const themeToggle = document.querySelector(".theme-toggle");
const dialog = document.querySelector("#gameplay-dialog");
const video = dialog.querySelector("video");
const closeButton = dialog.querySelector(".close-dialog");
const errorMessage = document.querySelector("#video-error");

function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
}

themeToggle.addEventListener("click", () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  updateThemeLabel();
});
updateThemeLabel();

document.querySelectorAll("[data-watch]").forEach((button) => {
  button.addEventListener("click", () => {
    dialog.showModal();
    video.load();
    closeButton.focus();
  });
});

closeButton.addEventListener("click", () => dialog.close());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog.open) {
    dialog.close();
  }
});
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  ) {
    dialog.close();
  }
});
dialog.addEventListener("close", () => video.pause());
video.addEventListener("error", () => {
  errorMessage.hidden = false;
});
video.querySelector("source").addEventListener("error", () => {
  errorMessage.hidden = false;
});
