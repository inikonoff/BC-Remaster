'use strict';
BC.levels = {
  // ASCII map is authored at 13x13 cells and expanded into 26x26 quarter tiles.
  // The engine also accepts native 26-character rows for future original maps.
  stage1: [
    '.............',
    '..B..B.B..B..',
    '..B..B.B..B..',
    '..B..B.B..B..',
    '.............',
    '.BB..S.S..BB.',
    '.....B.B.....',
    '.BB..B.B..BB.',
    '.....B.B.....',
    '..B.......B..',
    '..B..B.B..B..',
    '.....B.B.....',
    '.....BEB.....'
  ],
  enemyQueue: ['basic','fast','basic','power','basic','armor','fast','basic','power','basic','armor','fast','basic','power','armor','basic','fast','power','armor','basic'],
  expand(rows) {
    if (rows.length === 26 && rows.every(row => row.length === 26)) return rows.slice();
    if (rows.length !== 13 || rows.some(row => row.length !== 13)) throw new Error('Expected 13x13 or 26x26 map');
    const result = [];
    for (const row of rows) {
      const wide = Array.from(row, ch => ch + ch).join('');
      result.push(wide, wide);
    }
    // The base must be exactly one 2x2 cell at bottom center.
    result[24] = result[24].slice(0, 12) + 'EE' + result[24].slice(14);
    result[25] = result[25].slice(0, 12) + 'EE' + result[25].slice(14);
    return result;
  }
};
