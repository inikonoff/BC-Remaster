'use strict';
BC.render = {
  canvas: null, ctx: null, ground: null, layer: null, layerCtx: null,
  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.ground = document.createElement('canvas');
    this.ground.width = this.ground.height = 832;
    const g = this.ground.getContext('2d');
    g.fillStyle = '#44473e'; g.fillRect(0, 0, 832, 832);
    let seed = 9981;
    const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 19000; i++) {
      g.fillStyle = ['#94836b25', '#161d1933', '#a6a18d1c', '#7277602c'][Math.floor(rand() * 4)];
      g.fillRect(rand() * 832, rand() * 832, 1 + rand() * 4, 1 + rand() * 4);
    }
    // Static layer: ground + walls. Only changed quarter-tiles are redrawn.
    this.layer = document.createElement('canvas');
    this.layer.width = this.layer.height = 832;
    this.layerCtx = this.layer.getContext('2d', { alpha: false });
    this.layerCtx.drawImage(this.ground, 0, 0);
  },
  updateLayer() {
    const w = BC.world, g = this.layerCtx;
    if (!w.dirtyAny) return;
    for (let i = 0; i < 676; i++) {
      if (!w.dirty[i]) continue;
      w.dirty[i] = 0;
      const cx = i % 26, cy = (i - cx) / 26, x = cx * 32, y = cy * 32;
      g.drawImage(this.ground, x, y, 32, 32, x, y, 32, 32);
      const type = w.cells[i];
      if (type && type !== 3) this.tile(g, x, y, type, cx, cy);
    }
    w.dirtyAny = false;
  },
  tile(g, x, y, t, cx, cy) {
    if (t === 1) {
      if (BC.assets.draw(g, 'wall_brick', x, y, 32, 32)) return;
      g.fillStyle = '#955b47'; g.fillRect(x + 1, y + 1, 30, 30);
      g.fillStyle = '#c18a68'; g.fillRect(x + 2, y + 2, 27, 3);
      g.strokeStyle = '#392d27'; g.lineWidth = 2;
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + 1, y + i * 8); g.lineTo(x + 31, y + i * 8); g.stroke(); }
      g.beginPath(); g.moveTo(x + 16, y + 1); g.lineTo(x + 16, y + 8); g.moveTo(x + 9, y + 9); g.lineTo(x + 9, y + 16); g.moveTo(x + 20, y + 17); g.lineTo(x + 20, y + 24); g.stroke();
    } else if (t === 2) {
      if (BC.assets.draw(g, 'wall_steel', x, y, 32, 32)) return;
      g.fillStyle = '#65716e'; g.fillRect(x + 1, y + 1, 30, 30);
      g.fillStyle = '#b2b9ac'; g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + 28, y + 4); g.lineTo(x + 16, y + 15); g.closePath(); g.fill();
      g.fillStyle = '#394441'; g.beginPath(); g.moveTo(x + 4, y + 28); g.lineTo(x + 28, y + 28); g.lineTo(x + 16, y + 15); g.closePath(); g.fill();
    } else if (t === 6) {
      // The eagle is one 2x2-quarter sprite; each quarter draws its own clipped slice.
      const ax = Math.floor(cx / 2) * 64, ay = Math.floor(cy / 2) * 64;
      g.save(); g.beginPath(); g.rect(x, y, 32, 32); g.clip();
      if (BC.assets.draw(g, BC.world.baseAlive ? 'base_eagle' : 'base_eagle_destroyed', ax, ay, 64, 64)) { g.restore(); return; }
      g.fillStyle = BC.world.baseAlive ? '#746747' : '#2c2a25'; g.fillRect(ax, ay, 64, 64);
      g.fillStyle = BC.world.baseAlive ? '#e0bf73' : '#6a655a'; g.font = 'bold 56px serif'; g.textAlign = 'center';
      g.fillText(BC.world.baseAlive ? '\u2605' : '\u2716', ax + 32, ay + 51); g.textAlign = 'start';
      g.restore();
    } else if (t === 4) { g.fillStyle = '#3b6470'; g.fillRect(x, y, 32, 32); }
    else if (t === 5) { g.fillStyle = '#a5b8bd'; g.fillRect(x, y, 32, 32); }
  },
  tank(g, tank) {
    if (!tank) return;
    const angles = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
    g.save(); g.translate(tank.x, tank.y); g.rotate(angles[tank.dir] || 0);
    g.fillStyle = '#10181370'; g.fillRect(-24, -22, 52, 54);
    g.fillStyle = '#272e2b'; g.fillRect(-26, -27, 11, 54); g.fillRect(15, -27, 11, 54);
    g.strokeStyle = '#7b8277'; g.lineWidth = 2;
    for (let y = -23; y < 26; y += 7) { g.beginPath(); g.moveTo(-26, y); g.lineTo(-15, y); g.moveTo(15, y); g.lineTo(26, y); g.stroke(); }
    g.fillStyle = '#baa35d'; g.fillRect(-16, -22, 32, 44);
    g.fillStyle = '#ddc475'; g.beginPath(); g.arc(0, -2, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7c7049'; g.fillRect(-5, -37, 10, 29);
    g.fillStyle = '#534d36'; g.beginPath(); g.arc(0, -2, 5, 0, Math.PI * 2); g.fill();
    g.restore();
    if (tank.shield > 0) { g.strokeStyle = '#b7e8ffb0'; g.lineWidth = 3; g.beginPath(); g.arc(tank.x, tank.y, 37, 0, Math.PI * 2); g.stroke(); }
  },
  frame() {
    const g = this.ctx;
    this.updateLayer();
    g.drawImage(this.layer, 0, 0);
    for (const p of BC.vfx.pool) {
      if (!p.active) continue;
      const elapsed = p.max - p.life;
      const fade = Math.min(1, p.life / 1.0);
      g.save(); g.globalAlpha = fade;
      g.translate(p.x, p.y); g.rotate(p.angle);
      g.fillStyle = p.kind === 'spark' ? '#ffd782' : p.kind === 'steel' ? '#a4b2af' : '#9d6951';
      const size = p.kind === 'spark' ? 2 : 3 + (elapsed > 2 ? 0 : 2);
      g.beginPath(); g.moveTo(-size, -size); g.lineTo(size, -size * 0.5); g.lineTo(size * 0.5, size); g.lineTo(-size * 0.8, size * 0.7); g.closePath(); g.fill();
      g.restore();
    }
    for (const b of BC.entities.bullets) {
      if (!b.active) continue;
      g.fillStyle = '#fff0b3'; g.beginPath(); g.arc(b.x, b.y, 5, 0, Math.PI * 2); g.fill();
    }
    this.tank(g, BC.entities.player);
    // Forest is deliberately painted over tanks and projectiles.
    for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) {
      if (BC.world.get(x, y) !== 3) continue;
      g.fillStyle = '#344b2fc9'; g.beginPath(); g.arc(x * 32 + 16, y * 32 + 16, 19, 0, Math.PI * 2); g.fill();
    }
    if (BC.state.mode === 'paused') {
      g.fillStyle = '#101914b0'; g.fillRect(0, 350, 832, 110);
      g.fillStyle = '#f5e7b9'; g.font = 'bold 43px monospace'; g.textAlign = 'center'; g.fillText('PAUSED', 416, 418); g.textAlign = 'start';
    }
  }
};
