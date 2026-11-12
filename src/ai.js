'use strict';
// Enemy behavior is introduced in Stage 17. Keep a stable interface now.
BC.ai = { enemies: [], reset() { this.enemies.length = 0; }, update(_dt) {} };
