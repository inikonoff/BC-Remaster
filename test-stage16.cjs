const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const context = vm.createContext({ window: {}, console, Math, Uint8Array, Set, Image: function(){} });
for (const name of ['config','levels','world','vfx','audio','entities','ai']) {
  const source = fs.readFileSync(__dirname + '/src/' + name + '.js', 'utf8');
  vm.runInContext('var BC = window.BC;\n' + source, context, { filename: name + '.js' });
}
const BC = context.window.BC;
BC.world.reset(BC.levels.stage1);
BC.entities.reset();
assert.equal(BC.world.cells.length, 676);
assert.equal(BC.levels.expand(BC.levels.stage1).length, 26);
assert.equal(BC.levels.enemyQueue.length, 20);
assert.equal(BC.config.enemyCap, 4);
assert.equal(BC.world.get(12, 24), 6);
// Brick: a shot removes the nearest layer in a band two quarters wide.
BC.world.cells.fill(0);
for (const [x,y] of [[4,4],[5,4],[4,5],[5,5]]) BC.world.set(x,y,1);
assert.equal(BC.world.hitFront(160, 4*32+16, 0, 1), 'brick');   // bullet x=160 -> quarters 4,5
assert.equal(BC.world.get(4,4),0); assert.equal(BC.world.get(5,4),0);
assert.equal(BC.world.get(4,5),1); assert.equal(BC.world.get(5,5),1);
// Brick, tank offset by one quarter relative to the cell grid: removes the quarters right in front of it.
BC.world.cells.fill(0);
for (const [x,y] of [[7,4],[8,4],[9,4]]) BC.world.set(x,y,1);
assert.equal(BC.world.hitFront(256, 4*32+16, 0, 1), 'brick');   // bullet x=256 -> quarters 7,8
assert.equal(BC.world.get(7,4),0); assert.equal(BC.world.get(8,4),0); assert.equal(BC.world.get(9,4),1);
// Horizontal shot.
BC.world.cells.fill(0);
for (const [x,y] of [[4,6],[4,7],[4,8]]) BC.world.set(x,y,1);
assert.equal(BC.world.hitFront(4*32+10, 7*32, 1, 0), 'brick');  // y=224 -> quarters 6,7
assert.equal(BC.world.get(4,6),0); assert.equal(BC.world.get(4,7),0); assert.equal(BC.world.get(4,8),1);
// Steel: normal bullet does not break it, level-4 bullet does.
BC.world.cells.fill(0);
BC.world.set(4,4,2); BC.world.set(5,4,2);
assert.equal(BC.world.hitFront(160, 4*32+16, 0, 1, false), 'steel');
assert.equal(BC.world.get(4,4),2);
assert.equal(BC.world.hitFront(160, 4*32+16, 0, 1, true), 'steel');
assert.equal(BC.world.get(4,4),0); assert.equal(BC.world.get(5,4),0);
// Mixed brick + steel pair: brick breaks, steel stays.
BC.world.cells.fill(0);
BC.world.set(4,4,1); BC.world.set(5,4,2);
BC.world.hitFront(160, 4*32+16, 0, 1, false);
assert.equal(BC.world.get(4,4),0); assert.equal(BC.world.get(5,4),2);
// Eagle: any bullet destroys it.
BC.world.reset(BC.levels.stage1);
assert.equal(BC.world.hitFront(416, 24*32+4, 0, 1), 'base');
assert.equal(BC.world.baseAlive,false);
// Bunker: the eagle is covered on the left, top and right by brick.
BC.world.reset(BC.levels.stage1);
for (const [x,y] of [[11,24],[11,25],[14,24],[14,25],[12,23],[13,23]]) assert.equal(BC.world.get(x,y),1);
// Tank hitbox is exactly one cell: fits a 2-quarter corridor, not a 1-quarter one.
BC.world.cells.fill(0);
for (let y=0;y<26;y++){ BC.world.set(9,y,1); BC.world.set(12,y,1);} // corridor quarters 10,11 = 64 px
assert.equal(BC.world.blocksTank(352, 400, BC.config.playerSize), false);
BC.world.set(10,10,1);
assert.equal(BC.world.blocksTank(352, 10*32+16, BC.config.playerSize), true);
assert.equal(BC.config.playerSize, 64);
// Dirty tracking for the cached static layer.
BC.world.dirty.fill(0); BC.world.dirtyAny=false;
BC.world.set(3,3,1);
assert.equal(BC.world.dirtyAny,true); assert.equal(BC.world.dirty[3*26+3],1);
BC.world.cells.fill(0);
BC.entities.player.x=288;BC.entities.player.y=800;
BC.entities.tryMove(BC.entities.player,'up',1/60);
assert.ok(BC.entities.player.y<800);
BC.entities.player.cooldown=0;
assert.equal(BC.entities.fire(),true);
assert.equal(BC.entities.fire(),false);
console.log('PASS: grid, ASCII expansion, 20-enemy queue, 4-enemy cap, brick band (aligned and offset), steel, mixed pair, eagle, bunker, 64 px hitbox, dirty tracking, movement, bullet limit');
console.log('NOT IMPLEMENTED STAGE 16: bullet-bullet collisions, enemy spawn/AI, lives/game over from player hit');
