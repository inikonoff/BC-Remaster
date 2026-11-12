'use strict';
BC.input = {
  direction: null, fire: false, pressed: Object.create(null), stickDirection: null,
  init() {
    const directions = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
    document.addEventListener('keydown', event => {
      if (directions[event.code]) { event.preventDefault(); this.pressed[directions[event.code]] = performance.now(); }
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        if (!event.repeat && (BC.state.mode === 'menu' || BC.state.mode === 'ended')) BC.main.restart();
      }
      if (event.code === 'Space') this.fire = true;
      if (event.code === 'KeyP' && !event.repeat) BC.main.pause();
      if (event.code === 'KeyR' && !event.repeat) BC.main.restart();
      if (event.code === 'F3' && !event.repeat) { event.preventDefault(); BC.hud.toggleDebug(); }
      this.resolve();
    });
    document.addEventListener('keyup', event => {
      if (directions[event.code]) { delete this.pressed[directions[event.code]]; this.resolve(); }
      if (event.code === 'Space') this.fire = false;
    });
    window.addEventListener('blur', () => { this.pressed = Object.create(null); this.stickDirection = null; this.fire = false; this.resolve(); });
    const stick = document.getElementById('stick');
    const knob = document.getElementById('knob');
    let pointer = null;
    const move = event => {
      const r = stick.getBoundingClientRect();
      const dx = event.clientX - r.left - r.width / 2;
      const dy = event.clientY - r.top - r.height / 2;
      const len = Math.hypot(dx, dy);
      const distance = Math.min(len, 26);
      knob.style.transform = `translate(${len ? dx / len * distance : 0}px,${len ? dy / len * distance : 0}px)`;
      this.stickDirection = len < 14 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      this.resolve();
    };
    stick.addEventListener('pointerdown', event => { event.preventDefault(); pointer = event.pointerId; stick.setPointerCapture(pointer); move(event); });
    stick.addEventListener('pointermove', event => { if (pointer === event.pointerId) move(event); });
    const release = event => {
      if (pointer !== event.pointerId) return;
      pointer = null; knob.style.transform = 'translate(0,0)'; this.stickDirection = null; this.resolve();
    };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(type, release);
    const fire = document.getElementById('fire');
    fire.addEventListener('pointerdown', event => { event.preventDefault(); fire.setPointerCapture(event.pointerId); this.fire = true; });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) fire.addEventListener(type, () => { this.fire = false; });
    for (const el of [stick, fire]) { el.addEventListener('contextmenu', event => event.preventDefault()); el.addEventListener('selectstart', event => event.preventDefault()); }
  },
  resolve() {
    if (this.stickDirection) { this.direction = this.stickDirection; return; }
    let recent = -1; this.direction = null;
    for (const key of ['up', 'down', 'left', 'right']) {
      if (this.pressed[key] > recent) { recent = this.pressed[key]; this.direction = key; }
    }
  }
};
