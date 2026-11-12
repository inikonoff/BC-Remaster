# Battle City Remaster — Stage 16: Foundation

Offline Canvas 2D foundation following the user's 12 Nov 2026 specification. Open `index.html` directly in Chrome/Android WebView (`file://`); no server, network or CDN needed.

## Controls
- Desktop: arrows / WASD move in four directions, Space shoots, P pauses, R restarts, F3 toggles diagnostics.
- Touch: movable thumbstick and icon-only Fire button. Supports simultaneous movement and firing.
- START begins the sandbox.

## Implemented
- Split readable JavaScript into config, assets, input, levels, world, entities, ai, vfx, render, hud, audio, main.
- One global namespace `BC`; seeded PRNG; fixed 60 Hz simulation with accumulator and clamped frame duration.
- 13x13 authored ASCII map expanded into 26x26 quarter-tile grid, 832x832 logical canvas.
- Collision checks over 26x26 array, no block-list scans.
- Tank movement four directions, transverse grid alignment, obstacles; bullet substeps.
- Brick wall hit removes the closest row of two quarter-tiles, including real holes; steel ignores normal bullets and responds to level 4 bullets.
- Eagle and three-sided bunker; player bullet hitting eagle causes GAME OVER.
- Basic placeholder tank, brick, steel, earth, eagle and particles; icon-only touch controls.
- Manifest JSON plus classic `manifest.js` mirror to work under file://. Missing sprites fall back to procedural rendering.
- Pools for bullets and irregular particle shards; sound interface is a no-op.
- Hidden debug HUD (F3); optional automated logic checks in `test-stage16.cjs` and `BC.debug.selfTest()`.

## Intentionally deferred (Stage 17+)
- Enemy AI, enemy spawning, enemy bullets, bullet-vs-bullet collisions, lives/respawn, stage clear, real score and enemy count decrement, full game HUD.
- Six bonuses, terrain types in active levels, four player upgrades in normal gameplay, original map set, sound and final sprite art.
- Real visual fidelity depends on asset sheets A–G; currently placeholders.
- This foundation is a playable movement/destruction sandbox, not yet a complete level.

## Tests
- **Verified:** `node --check` for every JS file; `node test-stage16.cjs` passes (grid, ASCII map, queue, cap, brick band incl. offset tank, steel, eagle, bunker, 64 px hitbox, movement, bullet cap). Headless Chromium run: menu, movement, shooting bricks, eagle destruction -> GAME OVER, three viewports (desktop, phone portrait/landscape), no console errors.
- **Not verified:** real phone FPS on Honor X6c, visual browser interaction, touch multitouch on hardware, all game states in browser. No performance claims.

## Assets
- Put PNG files in `assets/`, set `file` in `assets/manifest.json`, and mirror it in `assets/manifest.js` (or regenerate the mirror).
- Blank file names mean no asset is ready. No external requests occur.
- Full asset sheet mapping will be finalized upon receiving A–G and the Style Bible.
