# Changelog

## Stage 16.1 — review fixes (Claude)
- Tank hitbox is now exactly one cell (64 px), as in the spec (was 55 px).
- A shot removes the quarters directly in front of the bullet band (two quarters wide, centred on the bullet). Previously the pair was chosen by cell parity, so a tank standing on an odd quarter broke the wrong bricks. `hitBrick` replaced by `hitQuarter` / `hitFront`.
- Eagle is drawn as one 64 px sprite (was a star in each of 4 quarters) and has a destroyed variant (`base_eagle_destroyed` in manifest).
- Static layer (ground + walls) is cached offscreen; only changed quarters are redrawn.
- Default particle quality is `high`; it steps down automatically after 2 s of frames slower than 24 ms.
- Bullets leaving the field spark at the edge. Enter / Space start or restart from the menu and game-over screens.
- `test-stage16.cjs` extended (offset tank, horizontal shot, mixed brick/steel pair, bunker, hitbox, dirty tracking).

## Stage 16 — 2026-11-12
- Rebuilt Stage 15 experimental prototype as modular offline Canvas foundation per new specification.
- Removed Three.js, CDN and network dependencies entirely.
- Added 26x26 grid with 13x13 ASCII authoring, brick-quarter destruction, steel rules and eagle bunker.
- Added seeded random, fixed 60 Hz update, input, joystick, projectile collision and pooled shards.
- Added manifest placeholders and offline JS mirror, test script, debug HUD and sound interface.
- Preserved original-style movement and icon-only fire button.
- Deferred enemy mechanics and other Stage 17–21 systems intentionally.
