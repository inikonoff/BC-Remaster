'use strict';
BC.entities = {
  player: null,
  bullets: Array.from({ length: 16 }, () => ({ active: false, x: 0, y: 0, dx: 0, dy: 0, owner: 'player' })),
  reset() {
    this.player = { x: 4 * 64 + 32, y: 12 * 64 + 32, dir: 'up', cooldown: 0, shield: 3, level: 1 };
    for (const b of this.bullets) b.active = false;
  },
  direction(name) {
    return { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[name];
  },
  tryMove(tank, dir, dt) {
    const vec = this.direction(dir);
    if (!vec) return;
    tank.dir = dir;
    const speed = BC.config.playerSpeed;
    const snap = BC.config.snapSpeed * dt;
    let nx = tank.x, ny = tank.y;
    if (vec[1]) {
      const target = Math.round((tank.x - 32) / 32) * 32 + 32;
      nx += Math.sign(target - nx) * Math.min(Math.abs(target - nx), snap);
      ny += vec[1] * speed * dt;
    } else {
      const target = Math.round((tank.y - 32) / 32) * 32 + 32;
      ny += Math.sign(target - ny) * Math.min(Math.abs(target - ny), snap);
      nx += vec[0] * speed * dt;
    }
    if (!BC.world.blocksTank(nx, tank.y, BC.config.playerSize)) tank.x = nx;
    if (!BC.world.blocksTank(tank.x, ny, BC.config.playerSize)) tank.y = ny;
  },
  fire() {
    const tank = this.player;
    if (tank.cooldown > 0) return false;
    const maxBullets = tank.level >= 3 ? 2 : 1;
    let count = 0;
    for (const b of this.bullets) if (b.active && b.owner === 'player') count++;
    if (count >= maxBullets) return false;
    const vec = this.direction(tank.dir);
    for (const b of this.bullets) {
      if (b.active) continue;
      b.active = true;
      b.owner = 'player';
      b.x = tank.x + vec[0] * 32;
      b.y = tank.y + vec[1] * 32;
      b.dx = vec[0]; b.dy = vec[1];
      b.speed = BC.config.bulletSpeed * (tank.level >= 2 ? 1.65 : 1);
      b.piercing = tank.level === 4;
      tank.cooldown = BC.config.bulletCooldown;
      BC.audio.play('shoot');
      return true;
    }
    return false;
  },
  update(dt) {
    const p = this.player;
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.shield = Math.max(0, p.shield - dt);
    if (BC.input.direction) this.tryMove(p, BC.input.direction, dt);
    if (BC.input.fire) this.fire();
    for (const b of this.bullets) {
      if (!b.active) continue;
      // Substeps prevent a fast bullet skipping a 32px quarter-tile.
      const distance = b.speed * dt;
      const steps = Math.ceil(distance / 8);
      for (let i = 0; i < steps && b.active; i++) {
        b.x += b.dx * distance / steps;
        b.y += b.dy * distance / steps;
        if (b.x < 0 || b.x >= 832 || b.y < 0 || b.y >= 832) {
          b.active = false;
          BC.vfx.flash(Math.min(831, Math.max(1, b.x)), Math.min(831, Math.max(1, b.y)));
          break;
        }
        const impact = BC.world.projectileCollision(b.x, b.y, b.dx, b.dy, b.piercing);
        if (impact) {
          b.active = false;
          BC.vfx.flash(b.x, b.y);
          if (impact === 'base') BC.main.end('GAME OVER');
        }
      }
    }
  }
};
