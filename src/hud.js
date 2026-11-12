'use strict';
BC.hud = {
  debug: false, fps: 0, frameMs: 0,
  toggleDebug() { this.debug = !this.debug; document.getElementById('debug').hidden = !this.debug; },
  update() {
    document.getElementById('stage').textContent = 'STAGE ' + BC.state.stage;
    document.getElementById('lives').textContent = 'LIVES ' + BC.state.lives;
    document.getElementById('remaining').textContent = 'ENEMIES ' + BC.config.enemyCount;
    document.getElementById('score').textContent = 'SCORE ' + String(BC.state.score).padStart(6, '0');
    if (this.debug) {
      let particles = 0; for (const p of BC.vfx.pool) if (p.active) particles++;
      document.getElementById('debug').textContent = `FPS ${this.fps.toFixed(1)} | ${this.frameMs.toFixed(1)}ms | VFX ${particles} | ${BC.config.quality}`;
    }
  },
  overlay(title, description, buttonText) {
    const overlay = document.getElementById('overlay');
    overlay.hidden = false;
    overlay.querySelector('h1').textContent = title;
    overlay.querySelector('p').textContent = description;
    overlay.querySelector('button').textContent = buttonText;
  },
  hide() { document.getElementById('overlay').hidden = true; }
};
