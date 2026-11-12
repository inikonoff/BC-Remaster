'use strict';
// The only application global. All tunable values live here.
window.BC = {
  config: {
    grid: 26, tile: 32, cell: 64, field: 832,
    fixedStep: 1 / 60, maxFrameTime: 0.1,
    playerSpeed: 3 * 64, bulletSpeed: 8 * 64,
    bulletRadius: 5, playerSize: 64, bulletCooldown: 0.15,
    snapSpeed: 290, snapTolerance: 3,
    lives: 3, shieldSeconds: 3,
    enemyCount: 20, enemyCap: 4,
    quality: 'high', seed: 1985,
    limits: { high: 120, medium: 60, low: 25 }
  },
  state: { mode: 'menu', time: 0, stage: 1, lives: 3, score: 0 },
  rng: { seed: 1985, next() { this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0; return this.seed / 4294967296; } }
};
