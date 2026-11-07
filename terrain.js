'use strict';
globalThis.PixelTerrain = (() => {
 const TILE=64,SIZES=[{name:'Pequeño',n:48},{name:'Mediano',n:80},{name:'Grande',n:128},{name:'Enorme',n:192},{name:'Colosal',n:384}];
 const hash=(x,y,seed)=>{let v=Math.imul(x^seed,374761393)^Math.imul(y+seed,668265263);v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967296;};
 function seedNumber(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
 const smooth=t=>t*t*(3-2*t);
 function noise(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy),a=hash(ix,iy,seed)*(1-fx)+hash(ix+1,iy,seed)*fx,b=hash(ix,iy+1,seed)*(1-fx)+hash(ix+1,iy+1,seed)*fx;return a*(1-fy)+b*fy;}
 function generate(size=0,seedText='Frontera'){const spec=SIZES[size]||SIZES[0],n=spec.n,seed=seedNumber(seedText),tiles=new Uint8Array(n*n),height=new Uint8Array(n*n),decor=new Uint8Array(n*n),variant=new Uint8Array(n*n),bases=[[10,n-11],[n-11,10],[10,10],[n-11,n-11]].map(([x,y])=>({x:(x+.5)*TILE,y:(y+.5)*TILE}));
 // Tile codes: deep sea, shoal, sand, meadow, forest, rock, mountain, valley, road.
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,edge=Math.min(x,y,n-1-x,n-1-y),coast=4+noise(x/9,y/9,seed+11)*2,h=noise(x/14,y/14,seed)*.65+noise(x/5,y/5,seed+7)*.35,m=noise(x/8,y/8,seed+27),v=hash(x,y,seed+63);variant[i]=Math.floor(v*255);
 if(edge<coast-1){tiles[i]=0;continue;}if(edge<coast){tiles[i]=1;continue;}if(edge<coast+1.2){tiles[i]=2;continue;}
 if(h>.73){tiles[i]=6;height[i]=3+Math.floor((h-.73)*12);decor[i]=3;}
 else if(h>.61){tiles[i]=5;height[i]=2;decor[i]=v>.4?2:0;}
 else if(h<.32){tiles[i]=7;height[i]=0;decor[i]=v>.85?4:0;}
 else {tiles[i]=m>.53?4:3;height[i]=h>.53?1:0;decor[i]=tiles[i]===4&&v>.22?1:v>.94?2:v>.75?4:0;}
 }
 // A seeded mountain ridge and valley guarantee a full landscape even on tiny worlds.
 const ridgeX=Math.floor(n*(.43+hash(4,1,seed)*.12)),ridgeY=Math.floor(n*(.38+hash(5,1,seed)*.15));
 for(let y=14;y<n-14;y++)for(let x=14;x<n-14;x++){const i=y*n+x,dx=(x-ridgeX)/(3+n*.035),dy=(y-ridgeY)/(2+n*.018),r=Math.hypot(dx,dy);if(r<1){tiles[i]=6;height[i]=3+Math.floor((1-r)*3);decor[i]=3;}else if(r<1.5){tiles[i]=5;height[i]=2;decor[i]=hash(x,y,seed)>.6?2:0;}else if(r<1.9){height[i]=1;}
 const valley=Math.hypot((x-n*.63)/(n*.09),(y-n*.65)/(n*.06));if(valley<1){tiles[i]=7;height[i]=0;decor[i]=hash(x,y,seed+8)>.6?4:0;}}
 // Guaranteed land corridors and flat landing zones keep every seed playable.
 const roads=[10,n-11];for(let y=6;y<n-6;y++)for(let x=6;x<n-6;x++){const i=y*n+x;if(roads.some(v=>Math.abs(x-v)<=1||Math.abs(y-v)<=1)){tiles[i]=8;height[i]=0;decor[i]=0;}}
 for(const b of bases){const bx=Math.floor(b.x/TILE),by=Math.floor(b.y/TILE);for(let y=by-4;y<=by+4;y++)for(let x=bx-4;x<=bx+4;x++){const i=y*n+x;if(x>=6&&y>=6&&x<n-6&&y<n-6){tiles[i]=3;height[i]=0;decor[i]=hash(x,y,seed+512)>.7?4:0;}}}
 const map={n,w:n*TILE,h:n*TILE,size,seed:seedText,tiles,height,decor,variant,bases,cache:new Map(),resources:[]};
 for(const b of bases){for(let j=0;j<5;j++)addResource(map,b.x-150+(j%3)*55,b.y+105+Math.floor(j/3)*55,'mineral');addResource(map,b.x+170,b.y-90,'gas');}
 for(let y=16;y<n-15;y+=9)for(let x=16;x<n-15;x+=9){const i=y*n+x;if(passable(map,x,y,'ground')&&tiles[i]!==8&&hash(x,y,seed+99)>.35){addResource(map,(x+.5)*TILE,(y+.5)*TILE,hash(x,y,seed+101)>.8?'gas':'mineral');}}
 return map;
 }
 function addResource(m,x,y,kind){const i=cell(m,x,y);if(i<0||m.tiles[i]<2||m.tiles[i]===6)return;const capacity=5000+Math.floor(hash(Math.floor(x),Math.floor(y),seedNumber(m.seed))*5001);m.decor[i]=0;m.height[i]=0;m.tiles[i]=3;m.resources.push({id:m.resources.length,x,y,kind,capacity,amount:capacity});}
 function cell(m,x,y){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);return tx<0||ty<0||tx>=m.n||ty>=m.n?-1:ty*m.n+tx;}
 function elevation(m,x,y){const i=cell(m,x,y);return i<0?0:m.height[i]*14;}
 function project(m,x,y,z=0){return {x:(x-y)*.75+m.h*.75,y:(x+y)*.375-z};}
 function unproject(m,x,y){return {x:y/.75+(x-m.h*.75)/1.5,y:y/.75-(x-m.h*.75)/1.5};}
 function pick(m,x,y){let result=null;for(let level=0;level<=7;level++){const p=unproject(m,x,y+level*14),i=cell(m,p.x,p.y);if(i>=0&&m.height[i]===level)result=p;}return result||unproject(m,x,y);}
 function passable(m,x,y,domain='ground'){if(x<0||y<0||x>=m.n||y>=m.n)return false;if(domain==='air')return true;const t=m.tiles[y*m.n+x];return domain==='sea'?t<=1:t>=2&&t!==6;}
 function waterNear(m,x,y,radius=3){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);let best=null,bd=Infinity;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(passable(m,tx+dx,ty+dy,'sea')){const p={x:(tx+dx+.5)*TILE,y:(ty+dy+.5)*TILE},d=Math.hypot(x-p.x,y-p.y);if(d<bd){best=p;bd=d;}}return best;}
 function segment(m,a,b,domain){let previous=cell(m,a.x,a.y);const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/20));for(let i=0;i<=steps;i++){const xx=a.x+(b.x-a.x)*i/steps,yy=a.y+(b.y-a.y)*i/steps,index=cell(m,xx,yy);if(!passable(m,Math.floor(xx/TILE),Math.floor(yy/TILE),domain)||domain==='ground'&&previous>=0&&Math.abs(m.height[index]-m.height[previous])>1)return false;previous=index;}return true;}
 // Binary-heap A*: complete paths for land and sea, cached for nearby formation members.
 function path(m,start,end,domain='ground'){if(domain==='air')return [{x:end.x,y:end.y}];const sx=Math.floor(start.x/TILE),sy=Math.floor(start.y/TILE),ex=Math.floor(end.x/TILE),ey=Math.floor(end.y/TILE);if(!passable(m,ex,ey,domain))return null;const key=[sx,sy,ex,ey,domain].join(':');if(m.cache.has(key))return m.cache.get(key)?.map(p=>({...p}));if(segment(m,start,end,domain))return [{x:end.x,y:end.y}];
 const n=m.n,total=n*n,g=new Float32Array(total);g.fill(Infinity);const prev=new Int32Array(total);prev.fill(-1);const closed=new Uint8Array(total),heap=[];const heuristic=(x,y)=>Math.hypot(ex-x,ey-y);function push(i,f){let j=heap.length;heap.push({i,f});while(j){const p=(j-1)>>1;if(heap[p].f<=f)break;heap[j]=heap[p];j=p;}heap[j]={i,f};}function pop(){const root=heap[0],last=heap.pop();if(heap.length){let j=0;while(j*2+1<heap.length){let c=j*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[j]=heap[c];j=c;}heap[j]=last;}return root.i;}
 const origin=sy*n+sx,target=ey*n+ex;if(origin<0||origin>=total)return null;g[origin]=0;push(origin,heuristic(sx,sy));let found=false;
 while(heap.length){const i=pop();if(closed[i])continue;if(i===target){found=true;break;}closed[i]=1;const x=i%n,y=Math.floor(i/n);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,yy=y+dy;if(!passable(m,xx,yy,domain)||dx&&dy&&(!passable(m,x+dx,y,domain)||!passable(m,x,y+dy,domain)))continue;const j=yy*n+xx;if(closed[j]||domain==='ground'&&Math.abs(m.height[j]-m.height[i])>1)continue;const cost=g[i]+(dx&&dy?1.414:1)*(m.tiles[j]===4?1.2:1);if(cost<g[j]){g[j]=cost;prev[j]=i;push(j,cost+heuristic(xx,yy));}}}
 if(!found){if(m.cache.size>128)m.cache.clear();m.cache.set(key,null);return null;}const result=[];for(let i=target;i!==origin&&i>=0;i=prev[i])result.push({x:(i%n+.5)*TILE,y:(Math.floor(i/n)+.5)*TILE});result.reverse();if(m.cache.size>128)m.cache.clear();m.cache.set(key,result);return result.map(p=>({...p}));
 }
 const colors=['#123847','#235f68','#b1a279','#456b49','#34573f','#797d6c','#929486','#638456','#81785b'];
 function polygon(g,pts,c){g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(Math.round(p[0]),Math.round(p[1])):g.moveTo(Math.round(p[0]),Math.round(p[1])));g.closePath();g.fill();}
 function tile(g,m,x,y,time,visibility=2){const i=y*m.n+x,t=m.tiles[i],z=visibility?m.height[i]*14:0,p=project(m,x*TILE,y*TILE,z),sx=p.x,sy=p.y;const pts=[[sx,sy],[sx+48,sy+24],[sx,sy+48],[sx-48,sy+24]];
 if(z){polygon(g,[[sx-48,sy+24],[sx,sy+48],[sx,sy+48+z],[sx-48,sy+24+z]],'#485344');polygon(g,[[sx,sy+48],[sx+48,sy+24],[sx+48,sy+24+z],[sx,sy+48+z]],'#343f38');for(let h=7;h<z;h+=9){g.strokeStyle='#71806b66';g.beginPath();g.moveTo(sx-45,sy+25+h);g.lineTo(sx,sy+46+h);g.lineTo(sx+45,sy+25+h);g.stroke();}}
 polygon(g,pts,visibility===0?'#101e2a':colors[t]);if(!visibility)return;
 const v=m.variant[i];for(let j=0;j<(t<2?16:38);j++){const u=hash(j,v,43),w=hash(j,v,89),px=sx+(u-w)*43,py=sy+(u+w)*22;g.fillStyle=t<2?(j%3?'#49858a55':'#a1c9bd44'):t===2?(j%2?'#e2cf9a88':'#716e4c55'):j%3?'#a4b87944':'#142f3044';g.fillRect(Math.round(px),Math.round(py),t<2?8:2+j%3,1+(j%2));}
 if(t>=2){for(let j=0;j<3;j++){const u=hash(j,v,315),w=hash(j,v,419),xx=sx+(u-w)*31,yy=sy+8+(u+w)*16;polygon(g,[[xx-9,yy],[xx-3,yy-4],[xx+6,yy-3],[xx+12,yy+2],[xx+2,yy+5],[xx-7,yy+4]],t===2?'#d4bd8540':t===5?'#a4aa8e33':t===8?'#4c503433':'#8aa15a22');}if(t===3||t===4||t===7)for(let j=0;j<5;j++){const u=hash(j,v,911),w=hash(j,v,121),xx=sx+(u-w)*40,yy=sy+(u+w)*22;g.strokeStyle=j%2?'#a8ba7255':'#213e3555';g.beginPath();g.moveTo(xx-2,yy-3);g.lineTo(xx,yy);g.lineTo(xx+2,yy-4);g.stroke();}}
 if(t<=1){for(const [dx,dy,edge] of [[1,0,[[sx+48,sy+24],[sx,sy+48]]],[0,1,[[sx,sy+48],[sx-48,sy+24]]],[-1,0,[[sx-48,sy+24],[sx,sy]]],[0,-1,[[sx,sy],[sx+48,sy+24]]]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<m.n&&yy<m.n&&m.tiles[yy*m.n+xx]>=2){g.strokeStyle='#c2ddbd99';g.lineWidth=2;g.beginPath();g.moveTo(...edge[0]);g.lineTo(...edge[1]);g.stroke();}}}
 if(t<2){const phase=(time*.6+v/50)%1;g.strokeStyle=t===1?'#b7dfc699':'#72acb444';g.lineWidth=1;g.beginPath();g.moveTo(sx-20+phase*15,sy+25);g.lineTo(sx-6+phase*15,sy+28);g.moveTo(sx+10,sy+15+phase*10);g.lineTo(sx+23,sy+18+phase*10);g.stroke();}
 if(visibility===1)polygon(g,pts,'#08142599');
 }
 function decoration(g,m,x,y,time){const i=y*m.n+x,type=m.decor[i];if(!type)return;const p=project(m,(x+.5)*TILE,(y+.5)*TILE,m.height[i]*14),v=m.variant[i];const r=(xx,yy,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(p.x+xx),Math.round(p.y+yy),w,h);};
 if(type===1&&v%3===0){r(-14,2,40,8,'#142c2866');r(-3,-40,6,42,'#615a39');r(-1,-35,2,35,'#a38b56');for(let j=0;j<5;j++){const xx=p.x+(j-2)*8,yy=p.y-34-Math.sin(j)*13;polygon(g,[[xx-19,yy],[xx-14,yy-16],[xx+3,yy-22],[xx+20,yy-10],[xx+19,yy+5],[xx,yy+14]],j%2?'#3f7048':'#527c4b');for(let k=0;k<10;k++){g.fillStyle=k%3?'#acc57966':'#173b3455';g.fillRect(xx+(hash(k,j,v)-.5)*30,yy+(hash(k,j,v+9)-.5)*24,3,2);}}}
 else if(type===1){const tall=35+v%30,wind=Math.sin(time*.7+v)*1.5;r(-14,2,37,7,'#122e2866');r(-3,-tall+12,6,tall-10,'#574f36');r(-1,-tall+13,2,tall-10,'#97835a');for(let j=0;j<4;j++){const yy=p.y-tall+j*10,ww=13+j*6;polygon(g,[[p.x+wind,yy-16],[p.x-ww,yy+14],[p.x+ww,yy+14]],j%2?'#315f40':'#244d37');polygon(g,[[p.x+wind,yy-16],[p.x-ww,yy+14],[p.x-2,yy+8]],'#508254');for(let k=0;k<6;k++)r((hash(k,j,v)-.5)*ww*1.4,-tall+j*10+hash(k,2,v)*14,3,2,'#82a56b88');}}
 else if(type===2||type===3){const h=type===3?50+v%45:12+v%15,w=type===3?36:18;polygon(g,[[p.x-w,p.y],[p.x-4,p.y-h],[p.x+w,p.y-4],[p.x+9,p.y+9]],'#737d70');polygon(g,[[p.x-4,p.y-h],[p.x+5,p.y-h*.35],[p.x+w,p.y-4],[p.x+9,p.y+9]],'#46594f');polygon(g,[[p.x-w,p.y],[p.x-4,p.y-h],[p.x+5,p.y-h*.35]],'#9ca591');if(type===3)polygon(g,[[p.x-4,p.y-h],[p.x-13,p.y-h*.65],[p.x-3,p.y-h*.72],[p.x+6,p.y-h*.55]],'#d2d6b9');for(let j=0;j<9;j++)r(-10+hash(j,v,3)*22,-h*.65+hash(j,v,9)*h*.65,3,2,'#c4c5a655');}
 else{for(let j=0;j<6;j++){r(-14+j*5,Math.sin(j)*5,1,4+j%3,'#9bad67');if(j%2)r(-14+j*5,Math.sin(j)*5,3,2,v%2?'#d8b07d':'#c6c99a');}}
 }
 function resource(g,n,time){const p={x:n.x,y:n.y};g.save();g.translate(p.x,p.y);if(n.kind==='gas'){polygon(g,[[-24,0],[0,-13],[24,0],[0,13]],'#36483e');for(let i=0;i<4;i++){g.fillStyle=['#85c393','#b5d78a','#599b7b'][i%3];g.fillRect(-14+i*8,-12-i%2*5,7,17);}for(let i=0;i<4;i++){const a=(time*.35+i*.25)%1;g.fillStyle='#a3d9ac44';g.fillRect(-12+i*7,-20-a*30,5+a*9,4+a*6);}}else{polygon(g,[[-28,2],[0,-13],[28,2],[0,15]],'#294b54');for(let i=0;i<5;i++){const x=-23+i*10,h=15+(i*13%22);polygon(g,[[x,-h],[x+6,-h-6],[x+9,3],[x,8]],'#57afc6');polygon(g,[[x+6,-h-6],[x+13,-h],[x+14,3],[x+9,3]],'#247691');g.fillStyle='#b5f1e9';g.fillRect(x+3,-h+2,2,h-4);}}g.restore();}
 return {TILE,SIZES,generate,cell,elevation,project,unproject,pick,passable,waterNear,segment,path,tile,decoration,resource,colors,hash};
})();
