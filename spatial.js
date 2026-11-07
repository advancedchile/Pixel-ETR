'use strict';
// Rebuilt once per simulation step; queries visit only nearby grid cells.
globalThis.PixelSpatial=class PixelSpatial {
 constructor(size=160){this.size=size;this.cells=new Map();this.visits=0;}
 rebuild(items){this.cells.clear();this.visits=0;for(const e of items){if(e.hp<=0)continue;const key=Math.floor(e.x/this.size)+','+Math.floor(e.y/this.size);let list=this.cells.get(key);if(!list){list=[];this.cells.set(key,list);}list.push(e);}}
 query(x,y,r,visit){const s=this.size;for(let yy=Math.floor((y-r)/s);yy<=Math.floor((y+r)/s);yy++)for(let xx=Math.floor((x-r)/s);xx<=Math.floor((x+r)/s);xx++){const list=this.cells.get(xx+','+yy);if(list)for(const e of list){this.visits++;if(visit(e)===false)return;}}}
};
