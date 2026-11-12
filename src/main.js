'use strict';
BC.main = {
  accumulator: 0, previous: 0, started: false, frames: 0, frameWindow: 0,
  init() {
    BC.assets.init(); BC.input.init(); BC.render.init();
    BC.world.reset(BC.levels.stage1);
    BC.entities.reset(); BC.ai.reset(); BC.vfx.reset();
    BC.hud.update(); BC.render.frame();
    document.getElementById('start').addEventListener('click', () => {
      if (BC.state.mode === 'paused') { this.pause(); return; }
      this.restart();
    });
    this.previous = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  },
  restart() {
    BC.rng.seed = BC.config.seed;
    BC.world.reset(BC.levels.stage1);
    BC.entities.reset(); BC.ai.reset(); BC.vfx.reset();
    BC.state.mode = 'playing'; BC.state.time = 0;
    BC.state.lives = BC.config.lives; BC.state.score = 0;
    this.accumulator = 0;
    BC.hud.hide();
  },
  pause() {
    if (BC.state.mode === 'playing') BC.state.mode = 'paused';
    else if (BC.state.mode === 'paused') BC.state.mode = 'playing';
  },
  end(title) {
    BC.state.mode = 'ended';
    BC.hud.overlay(title, 'Этап 16: фундамент игры', 'RESTART');
  },
  step(dt) {
    if (BC.state.mode !== 'playing') return;
    BC.state.time += dt;
    BC.entities.update(dt);
    BC.ai.update(dt);
    BC.vfx.update(dt);
  },
  // Drop the particle quality one step after two consecutive slow seconds (>24 ms per frame).
  slowSeconds: 0,
  autoQuality() {
    this.slowSeconds = BC.hud.frameMs > 24 ? this.slowSeconds + 1 : 0;
    if (this.slowSeconds < 2) return;
    this.slowSeconds = 0;
    const next = { high: 'medium', medium: 'low' }[BC.config.quality];
    if (next) BC.config.quality = next;
  },
  loop(now) {
    const elapsed = Math.min((now - this.previous) / 1000, BC.config.maxFrameTime);
    this.previous = now;
    this.accumulator += elapsed;
    let steps = 0;
    while (this.accumulator >= BC.config.fixedStep && steps < 6) {
      this.step(BC.config.fixedStep);
      this.accumulator -= BC.config.fixedStep;
      steps++;
    }
    if (steps === 6) this.accumulator = 0;
    BC.render.frame(); BC.hud.update();
    this.frames++; this.frameWindow += elapsed;
    if (this.frameWindow >= 1) {
      BC.hud.fps = this.frames / this.frameWindow;
      BC.hud.frameMs = this.frameWindow * 1000 / this.frames;
      this.autoQuality();
      this.frames = 0; this.frameWindow = 0;
    }
    requestAnimationFrame(this.loop.bind(this));
  }
};
BC.debug = {
  selfTest() {
    const result = {};
    const original = BC.world.cells.slice();
    const base = BC.world.baseAlive;
    BC.world.cells.fill(0);
    BC.world.set(6, 6, 1); BC.world.set(7, 6, 1);
    BC.world.set(6, 7, 1); BC.world.set(7, 7, 1);
    BC.world.hitFront(224, 208, 0, -1);  // tank-width band at quarters 6..7
    result.brickLayer = BC.world.get(6, 6) === 0 && BC.world.get(7, 6) === 0 && BC.world.get(6, 7) === 1;
    BC.world.set(12, 24, 6);
    result.eagleDeath = BC.world.hitFront(416, 780, 0, 1) === 'base' && !BC.world.baseAlive;
    result.enemyCap = BC.config.enemyCap === 4;
    result.enemyCount = BC.levels.enemyQueue.length === 20;
    result.bulletVsBullet = 'NOT_IMPLEMENTED_STAGE_17';
    BC.world.cells.set(original); BC.world.baseAlive = base;
    BC.vfx.reset();
    console.table(result);
    return result;
  }
};
BC.main.init();
