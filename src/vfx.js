'use strict';
BC.vfx = {
  pool: Array.from({ length: 120 }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 0, kind: 'brick', angle: 0 })),
  reset() { for (const p of this.pool) p.active = false; },
  burst(x, y, kind) {
    const limit = BC.config.limits[BC.config.quality];
    let active = 0;
    for (const p of this.pool) if (p.active) active++;
    for (let i = 0; i < 6 && active < limit; i++) {
      const p = this.pool.find(item => !item.active);
      if (!p) return;
      const angle = BC.rng.next() * Math.PI * 2;
      const speed = 60 + BC.rng.next() * 120;
      p.active = true; p.x = x; p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = p.max = 1.8 + BC.rng.next() * 1.4;
      p.kind = kind; p.angle = angle; active++;
    }
  },
  flash(x, y) { this.burst(x, y, 'spark'); },
  update(dt) {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }
      const elapsed = p.max - p.life;
      if (elapsed < 0.4) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94; p.vy *= 0.94;
      }
    }
  }
};
