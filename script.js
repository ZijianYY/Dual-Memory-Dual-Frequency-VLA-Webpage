"use strict";
// 图片上传到对应路径后，会自动替换占位区，无需修改 HTML。
function initializeMedia(root = document) {
  root.querySelectorAll("[data-image]:not([data-initialized])").forEach(slot => {
    slot.dataset.initialized = "true";
    const image = new Image();
    image.alt = slot.dataset.alt || "D²-VLA research figure";
    image.decoding = "async";
    image.onload = () => { slot.append(image); slot.classList.add("has-media"); };
    image.src = slot.dataset.image;
  });
  root.querySelectorAll("[data-video]:not([data-initialized])").forEach(slot => {
    slot.dataset.initialized = "true";
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", slot.dataset.alt || "Robot demonstration");
    video.hidden = true;
    video.addEventListener("loadedmetadata", () => {
      video.hidden = false;
      slot.classList.add("has-media");
    }, { once: true });
    video.addEventListener("error", () => {
      video.hidden = true;
      slot.classList.remove("has-media");
      const label = slot.querySelector(".placeholder-caption");
      if (label && video.error && video.error.code === 3) label.textContent = "This video could not be played.";
    });
    video.src = slot.dataset.video;
    slot.append(video);
  });
}
initializeMedia();
const config = window.SITE_CONFIG || {};
function allowedUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try { const url = new URL(value, location.href); return ["https:", "http:", "file:"].includes(url.protocol) ? value : null; } catch { return null; }
}
if (allowedUrl(config.paperUrl)) {
  const link = document.getElementById("paper-link");
  link.href = config.paperUrl;
  link.textContent = "PDF ↗";
}
if (allowedUrl(config.projectUrl)) {
  const link = document.getElementById("project-link");
  link.href = config.projectUrl;
  link.hidden = false;
}

const copyButton = document.getElementById("copy-citation");
copyButton?.addEventListener("click", async () => {
  const source = document.getElementById("bibtex");
  const status = document.getElementById("copy-status");
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(source.textContent);
    copyButton.textContent = "Copied";
    status.textContent = "Citation copied to clipboard.";
    setTimeout(() => { copyButton.textContent = "Copy BibTeX"; status.textContent = ""; }, 2500);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(source);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy.";
  }
});

// Task names and video pairs are configured on the four buttons in index.html.
const heroTaskButtons = document.querySelectorAll("[data-hero-task]");
heroTaskButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.getAttribute("aria-pressed") === "true") return;
    heroTaskButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    const title = button.dataset.title;
    document.getElementById("hero-task-title").textContent = title;
    ["left", "right"].forEach((side, index) => {
      const video = document.getElementById(`hero-video-${side}`);
      const source = button.dataset[`${side}Video`];
      video.pause();
      video.src = source;
      video.setAttribute("aria-label", `${title}, demonstration ${index + 1}`);
      document.getElementById(`hero-download-${side}`).href = source;
      video.load();
    });
  });
});
