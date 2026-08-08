const viewportWidths = {
  desktop: 1440,
  tablet: 820,
  mobile: 390,
};

const viewportHeights = {
  desktop: 980,
  tablet: 1180,
  mobile: 844,
};

const stage = document.querySelector('.preview-stage');
const frame = document.querySelector('.preview-frame');
const canvas = document.querySelector('.preview-canvas');
const preview = document.querySelector('.preview-canvas iframe');
const readout = document.querySelector('.viewport-readout');
const viewportButtons = Array.from(document.querySelectorAll('[data-viewport]'));
const gridToggle = document.querySelector('.grid-toggle');
const swatches = Array.from(document.querySelectorAll('[data-copy]'));
const copyHint = document.querySelector('.copy-hint');
const copyToast = document.querySelector('.copy-toast');

let activeMode = 'desktop';
let gridVisible = false;

function resizePreview() {
  if (!stage || !frame || !canvas || !preview || !readout) return;

  const viewportWidth = viewportWidths[activeMode];
  const availableWidth = Math.max(280, stage.clientWidth - 48);
  const scale = Math.min(1, availableWidth / viewportWidth);
  const contentHeight = preview.contentDocument?.documentElement.scrollHeight ?? viewportHeights[activeMode];

  preview.style.width = `${viewportWidth}px`;
  preview.style.height = `${contentHeight}px`;
  preview.style.transform = `scale(${scale})`;
  canvas.style.width = `${viewportWidth * scale}px`;
  canvas.style.height = `${contentHeight * scale}px`;
  frame.style.width = `${viewportWidth * scale}px`;
  readout.textContent = `${viewportWidth} × ${contentHeight}`;
}

function setViewport(mode) {
  if (!(mode in viewportWidths) || !stage) return;
  activeMode = mode;
  stage.dataset.mode = mode;

  viewportButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.viewport === mode));
  });

  window.requestAnimationFrame(() => {
    resizePreview();
    window.setTimeout(resizePreview, 120);
  });
}

function syncGrid() {
  if (!preview?.contentDocument?.body || !gridToggle) return;
  preview.contentDocument.body.classList.toggle('show-grid', gridVisible);
  gridToggle.setAttribute('aria-pressed', String(gridVisible));
}

viewportButtons.forEach((button) => {
  button.addEventListener('click', () => setViewport(button.dataset.viewport));
});

gridToggle?.addEventListener('click', () => {
  gridVisible = !gridVisible;
  syncGrid();
});

preview?.addEventListener('load', () => {
  syncGrid();
  resizePreview();

  const images = Array.from(preview.contentDocument?.images ?? []);
  images.forEach((image) => image.addEventListener('load', resizePreview, { once: true }));
});

window.addEventListener('resize', resizePreview);

swatches.forEach((swatch) => {
  swatch.addEventListener('click', async () => {
    const value = swatch.dataset.copy;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      if (copyHint) copyHint.textContent = `${value} 已复制`;
      if (copyToast) {
        copyToast.textContent = `${value} 已复制`;
        copyToast.classList.add('is-visible');
        window.setTimeout(() => copyToast.classList.remove('is-visible'), 1400);
      }
    } catch {
      if (copyHint) copyHint.textContent = `HEX：${value}`;
    }
  });
});

setViewport('desktop');
