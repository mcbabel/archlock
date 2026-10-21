// Copy buttons and a reduced-motion pause for the demo video. No tracking, no requests.
const status = document.getElementById("copied");
for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = "Copied";
      if (status) status.textContent = "Copied to the clipboard.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(button.getAttribute("aria-describedby")));
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      button.textContent = "Selected";
      if (status) status.textContent = "Selected. Press Ctrl+C or Cmd+C to copy.";
    }
    setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  });
}

if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  for (const video of document.querySelectorAll("video[autoplay]")) {
    video.removeAttribute("autoplay");
    video.pause();
  }
}
