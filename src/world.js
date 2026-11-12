'use strict';
BC.world = {
  cells: new Uint8Array(26 * 26), dirty: new Uint8Array(26 * 26), dirtyAny: true, baseAlive: true,
  type: { '.': 0, B: 1, S: 2, F: 3, W: 4, I: 5, E: 6 },
  reset(map) {
    const rows = BC.levels.expand(map);
    this.cells.fill(0);
    this.baseAlive = true;
    this.dirty.fill(1); this.dirtyAny = true;
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 26; x++) this.cells[y * 26 + x] = this.type[rows[y][x]] ?? 0;
    }
    // Three-sided brick bunker around the eagle, with an open bottom.
    for (let y = 22; y <= 23; y++) {
      this.set(11, y, 1); this.set(12, y, 1); this.set(13, y, 1); this.set(14, y, 1);
    }
    this.set(11, 24, 1); this.set(11, 25, 1);
    this.set(14, 24, 1); this.set(14, 25, 1);
    this.set(12, 24, 6); this.set(13, 24, 6);
    this.set(12, 25, 6); this.set(13, 25, 6);
  },
  get(x, y) {
    if (x < 0 || x >= 26 || y < 0 || y >= 26) return 2;
    return this.cells[y * 26 + x];
  },
  set(x, y, value) {
    if (x < 0 || x >= 26 || y < 0 || y >= 26) return;
    this.cells[y * 26 + x] = value;
    this.dirty[y * 26 + x] = 1; this.dirtyAny = true;
  },
  blocksTank(x, y, size) {
    const r = size / 2 - 0.1; // tank hitbox is exactly one cell (2x2 quarters)
    const left = Math.floor((x - r) / 32), right = Math.floor((x + r) / 32);
    const top = Math.floor((y - r) / 32), bottom = Math.floor((y + r) / 32);
    for (let cy = top; cy <= bottom; cy++) {
      for (let cx = left; cx <= right; cx++) {
        const t = this.get(cx, cy);
        if (t === 1 || t === 2 || t === 4 || t === 6) return true;
      }
    }
    return false;
  },
  // One quarter-tile hit by a bullet. Returns 'base' | 'brick' | 'steel' | null.
  hitQuarter(x, y, steelPiercing) {
    const type = this.get(x, y);
    if (type === 6) {
      if (this.baseAlive) {
        this.baseAlive = false;
        // Redraw all four eagle quarters as the destroyed variant.
        for (let i = 12; i <= 13; i++) for (let j = 24; j <= 25; j++) this.set(i, j, 6);
        BC.audio.play('game_over');
      }
      return 'base';
    }
    if (type !== 1 && type !== 2) return null;
    if (type === 2 && !steelPiercing) { BC.audio.play('hit_steel'); return 'steel'; }
    this.set(x, y, 0);
    BC.vfx.burst(x * 32 + 16, y * 32 + 16, type === 2 ? 'steel' : 'brick');
    BC.audio.play(type === 2 ? 'hit_steel' : 'hit_brick');
    return type === 2 ? 'steel' : 'brick';
  },
  // A bullet hits the nearest layer in a band two quarters wide (one tank width),
  // centred on the bullet path. (px, py) is the bullet centre, (dx, dy) its direction.
  hitFront(px, py, dx, dy, steelPiercing = false) {
    const horizontal = dx !== 0;
    const lateral = horizontal ? py : px;
    const front = Math.floor((horizontal ? px : py) / 32);
    const q1 = Math.floor((lateral - 16) / 32), q2 = Math.floor((lateral + 16) / 32);
    let result = null;
    for (const q of q1 === q2 ? [q1] : [q1, q2]) {
      const r = horizontal ? this.hitQuarter(front, q, steelPiercing) : this.hitQuarter(q, front, steelPiercing);
      if (r === 'base' || (r && result !== 'base' && (result === null || r === 'brick'))) result = r;
    }
    return result;
  },
  projectileCollision(x, y, dx, dy, steelPiercing = false) {
    return this.hitFront(x, y, dx, dy, steelPiercing);
  }
};
