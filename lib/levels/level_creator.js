const Shape = require('../shape');
const Sprite = require('../sprite/sprite.js');

const Coin = require('../entities/coin.js');
const ItemBlock = require('../entities/item_block.js');
const Player = require('../entities/player.js');
const Galoomba = require('../entities/galoomba.js');
const GoalTape = require('./goal_tape.js');

class Level {
  constructor(canvases, inputF) {
    this.canvases = canvases;
    this.inputFetcher = inputF;
    this.colliders = [];
    this.tiles = [];
    this.entities = {player: null, enemies: [], items: []};
    this.border = {x: {min: 0, max: 100}, y: {min: 0, max: 100}};

    let groundSheet = new Image();
    groundSheet.src = 'assets/images/ground_tiles.png';
    this.sheets = {ground: groundSheet};
  }

  getKeys() {
    let objectSheet = new Image();
    objectSheet.src = 'assets/images/misc_objects.png';

    const pl = {
      entity: 'player'
    };
    const en = {
      entity: 'enemy'
    };

    const ki = {
      entity: 'kill'
    };

    //main ground tiles
    const tl = { row: 0, col: 0, collider: 'through', height: 16, offset: {x: 0, y: -8}};
    const to = { row: 1, col: 0, collider: 'through', height: 16, offset: {x: 0, y: -8}};
    const tr = { row: 2, col: 0, collider: 'through', height: 16, offset: {x: 0, y: -8}};
    const ml = { row: 0, col: 1, collider: false};
    const mi = { row: 1, col: 1, collider: false};
    const mr = { row: 2, col: 1, collider: false};
    const bl = { row: 0, col: 2, collider: 'block'};
    const bo = { row: 1, col: 2, collider: 'block'};
    const br = { row: 2, col: 2, collider: 'block'};
    const __ = null;

    //walls and and corners
    const ww = { row: 3, col: 0, collider: 'block'};
    const we = { row: 5, col: 0, collider: 'block'};
    const wl = { row: 3, col: 1, collider: 'block'};
    const wr = { row: 5, col: 1, collider: 'block'};
    const wb = { row: 3, col: 2, collider: 'block'};
    const wd = { row: 5, col: 2, collider: 'block'};

    //3 x 3 chunk
    const ch = {
      chunk: [
        [ww,to,we],
        [wl,mi,wr],
        [wb,bo,wd],
      ]
    };

    //Tower
    const tw = {
      chunk: [
        [tl,to,tr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
        [ml,mi,mr],
      ]
    };

    //Walled tower
    const wt = {
      chunk: [
        [ww,to,we],
        [wl,mi,wr],
        [wl,mi,wr],
        [wl,mi,wr],
        [wl,mi,wr],
        [wl,mi,wr],
        [wl,mi,wr],
        [wb,bo,wd],
      ]
    };

    const t1 = { row: 5, col: 4, collider: 'block'};
    const t2 = { row: 6, col: 4, collider: 'block'};
    const t3 = { row: 5, col: 3, collider: 'block'};
    const t4 = { row: 6, col: 3, collider: 'block'};
    const td = {
      chunk: [
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t3,t4],
        [t1,t2],
      ],
      sheet: objectSheet
    };

    //goal gate
    const bt = { row: 0, col: 7, collider: false};
    const bm = { row: 0, col: 8, collider: false};
    const ft = { row: 1, col: 7, collider: false};
    const fm = { row: 1, col: 8, collider: false};
    const tt = { row: 2, col: 7, collider: 'trigger', width: 64, entity: 'tape'};
    const go = {entity: 'goal'};
    const g1 = {
      chunk: [
        [bt,__],
        [bm,__],
        [bm,__],
        [bm,__],
        [bm,__],
        [bm,__],
        [bm,__],
        [bm,__],
        [bm,tt],
      ],
      sheet: objectSheet,
      ctx: this.canvases.main.getContext('2d')
    };
    const g2 = {
      chunk: [
        [ft],
        [fm],
        [fm],
        [fm],
        [fm],
        [fm],
        [fm],
        [fm],
        [fm],
      ],
      sheet: objectSheet,
      ctx: this.canvases.main.getContext('2d')
    };
    const gg = {
      chunk: [
        [g1,__,g2]
      ]
    };


    const ib = { row: 0, col: 2, collider: 'block', sheet: objectSheet, entity: 'itemBlock'};
    const co = { row: 0, col: 4, collider: false, sheet: objectSheet, entity: 'coin'};

    return {
      pl, en, ki, tl, to, tr, ml, mi,
      mr, bl, bo, br, __, ww, we, wl,
      wr, wb, wd, ch, bt, bm, ft, fm,
      tt, go, gg, ib, co, tw, wt, td
    };
  }

  createLevel(level) {
    let groundSheet = new Image();
    groundSheet.src = 'assets/images/ground_tiles.png';

    const map = [[level]];

    this.ParseMap(map, groundSheet, {x:0, y: 0}, true);
  }

  createTile(key, sheet, i, j, offset, ctx) {
    let newTile = new Sprite({
      ctx: ctx || this.canvases.main.getContext('2d'),
      image: key.sheet || sheet,
      pos: {x: (i + offset.x) * 32, y: (j + offset.y) * 32},
      row: key.row,
      col: key.col
    });

    return newTile;
  }

  createCollider(key, i, j, offset) {
    const pixelOffset = key.offset || {x: 0, y: 0};
    let newCollider = new Shape({
      pos: {x: ((i + offset.x) * 32) + pixelOffset.x, y: ((j + offset.y) * 32) + pixelOffset.y},
      width: key.width || 32,
      height: key.height || 32,
      color: 'rgba(0,0,0,0)'},
      this.canvases.main.getContext('2d'),
      key.collider
    );
    return newCollider;
  }

  createEntity(type, x, y) {
    switch (type) {
      case 'player':
        this.entities.player = new Player({pos: {x, y}}, [], this.canvases.entities.getContext('2d'), null, this.inputFetcher);
        return;
      case 'coin':
        const coin = new Coin({ctx: this.canvases.main.getContext('2d'), pos: {x, y}});
        this.entities.items.push(coin);
        this.colliders.push(coin.shape);
        return;
      case 'itemBlock':
        const itemBlock = new ItemBlock({ctx: this.canvases.main.getContext('2d'), pos: {x, y}});
        this.entities.items.push(itemBlock);
        this.colliders.push(itemBlock.shape);
        return;
      case 'enemy':
        let enemy = new Galoomba({pos: {x, y}, width: 32, height: 32}, [], this.canvases.entities.getContext('2d'));
        this.entities.enemies.push(enemy);
        this.colliders.push(enemy.trigger);
        return;
      case 'tape':
        const ctx = this.canvases.main.getContext('2d');
        const tape = new GoalTape({x: x - 32, y}, ctx);
        this.tiles.push(tape);
        this.colliders.push(tape.collider);

        let newCollider = new Shape({
          pos: {x: x + 32, y},
          width: 32,
          height: 1028,
          color: 'rgba(0,0,0,0)'},
          ctx,
          'trigger',
          tape
        );
        this.colliders.push(newCollider);
        return;
      case 'goal':
        return;
      case 'kill':
        this.colliders.push(new Shape({pos: {x, y}, width: 10000, height: 32}, this.canvases.main.getContext('2d'), 'kill'));
        return;
      default:

    }
  }

  ParseMap(map, sheet, offset={x:0, y:0}, main, ctx) {
    map.forEach((row, j) => {
      row.forEach((key, i) => {
        if (key === null) {
          return;
        }

        if (key.entity) {
          this.createEntity(key.entity, (i + offset.x) * 32, (j + offset.y) * 32);
          return;
        }
        if (key.chunk) {
          this.ParseMap(key.chunk, key.sheet || sheet, {x: i + offset.x, y: j + offset.y}, false, key.ctx);
          return;
        }

        if (key.collider) {
          let newCollider = this.createCollider(key, i, j, offset);
          this.colliders.push(newCollider);
        }

        let newTile = this.createTile(key, sheet, i, j, offset, ctx);
        this.tiles.push(newTile);

      });
    });

    if (main) {
      this.finishParse(map);
    }
  }

  finishParse(map) {
    this.entities.player.colliders,
    this.entities.player.collision.colliders = this.colliders;

    this.entities.player.enemies = this.entities.enemies,
    this.entities.player.collision.enemies = this.entities.enemies;

    this.entities.enemies.forEach((entity) => {
      entity.colliders, entity.collision.colliders = this.colliders;
    });

    this.border.y = map[0][0].chunk.length;
  }
}

module.exports = Level;
