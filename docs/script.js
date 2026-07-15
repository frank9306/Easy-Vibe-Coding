const button = document.querySelector("#copy");
button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(button.dataset.command);
  const original = button.textContent;
  button.textContent = "已复制 · COPIED";
  setTimeout(() => { button.textContent = original; }, 1600);
});
