export function explosionAt(seconds) {
  const phase = (seconds % 9) / 9;
  const amount = phase < 0.15 ? 0 : phase < 0.43 ? (phase - 0.15) / 0.28 : phase < 0.68 ? 1 : phase < 0.96 ? 1 - (phase - 0.68) / 0.28 : 0;
  return amount * amount * (3 - 2 * amount);
}

export function loadBurgerImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The burger photo could not load. Please try again.'));
    image.src = source;
  });
}

export function paintBurger(canvas, image, food, amount, active = null) {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  context.fillStyle = '#101a14';
  context.fillRect(0, 0, width, height);
  const glow = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.65);
  glow.addColorStop(0, '#463222');
  glow.addColorStop(1, '#101a14');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  const scale = width * 0.88 / food.w;
  const gap = width * 0.085 * amount;
  const totalHeight = food.layers.reduce((total, layer) => total + layer.h * scale, 0) + gap * (food.layers.length - 1);
  let top = (height - totalHeight) / 2;
  food.layers.forEach((layer, index) => {
    context.save();
    context.globalAlpha = active === null || active === index ? 1 : 0.35;
    context.globalCompositeOperation = 'lighten';
    context.drawImage(image, food.x / food.SW * image.width, layer.y / food.SH * image.height, food.w / food.SW * image.width, layer.h / food.SH * image.height, width * 0.06, top, food.w * scale, layer.h * scale);
    context.restore();
    top += layer.h * scale + gap;
  });
  context.fillStyle = '#ffc857';
  context.font = `600 ${width * 0.025}px sans-serif`;
  context.textAlign = 'center';
  context.fillText('FASTFOOD / THE GOOD STUFF, LAYER BY LAYER', width / 2, height * 0.06);
  context.fillStyle = '#f7f5ee';
  context.font = `700 ${width * 0.04}px sans-serif`;
  context.fillText(food.label, width / 2, height * 0.93);
}

export async function exportBurgerVideo(food, onProgress, signal) {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error('Video export is not supported in this browser. Try Chrome or Edge.');
  }
  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error('This browser has no supported video encoder. Try Chrome or Edge.');
  const image = await loadBurgerImage(food.src);
  if (signal.aborted) return;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  paintBurger(canvas, image, food, 0);
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
  const chunks = [];
  let frame;
  try {
    await new Promise((resolve, reject) => {
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => reject(new Error('Video encoding failed. Please try again.'));
      recorder.onstop = resolve;
      signal.addEventListener('abort', () => { cancelAnimationFrame(frame); if (recorder.state !== 'inactive') recorder.stop(); }, { once: true });
      recorder.start();
      const start = performance.now();
      const tick = (now) => {
        const seconds = Math.min((now - start) / 1000, 9);
        paintBurger(canvas, image, food, explosionAt(seconds));
        onProgress(Math.round(seconds / 9 * 100));
        if (seconds >= 9) recorder.stop();
        else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    if (signal.aborted) return;
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fastfood-${food.label.toLowerCase().replaceAll(' ', '-')}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    cancelAnimationFrame(frame);
    stream.getTracks().forEach((track) => track.stop());
  }
}
