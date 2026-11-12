'use strict';
BC.assets = {
  manifest: {}, images: {}, missing: new Set(),
  // file:// blocks fetch() for local JSON in many browsers. manifest.js is the runtime mirror.
  init() {
    this.manifest = BC.assetManifest || {};
    for (const [key, entry] of Object.entries(this.manifest)) {
      if (!entry.file) continue;
      const image = new Image();
      image.onload = () => { this.images[key] = image; };
      image.onerror = () => { this.warnOnce(key); };
      image.src = 'assets/' + entry.file;
    }
  },
  warnOnce(key) {
    if (this.missing.has(key)) return;
    this.missing.add(key);
    console.info('[Battle City] Placeholder for missing asset:', key);
  },
  draw(ctx, key, x, y, w, h) {
    const image = this.images[key];
    if (!image) { this.warnOnce(key); return false; }
    const entry = this.manifest[key] || {};
    ctx.save();
    if (entry.blend === 'additive') ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
    return true;
  }
};
