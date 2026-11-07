'use strict';
globalThis.PixelTerrain = (() => {
 const TILE=64,SIZES=[{name:'Pequeño',n:48},{name:'Mediano',n:80},{name:'Grande',n:128},{name:'Enorme',n:192},{name:'Colosal',n:384}];
 const hash=(x,y,seed)=>{let v=Math.imul(x^seed,374761393)^Math.imul(y+seed,668265263);v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967296;};
 function seedNumber(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
 const smooth=t=>t*t*(3-2*t);
 function noise(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy),a=hash(ix,iy,seed)*(1-fx)+hash(ix+1,iy,seed)*fx,b=hash(ix,iy+1,seed)*(1-fx)+hash(ix+1,iy+1,seed)*fx;return a*(1-fy)+b*fy;}
 function generate(size=0,seedText='Frontera'){const spec=SIZES[size]||SIZES[0],n=spec.n,seed=seedNumber(seedText),tiles=new Uint8Array(n*n),height=new Uint8Array(n*n),decor=new Uint8Array(n*n),variant=new Uint8Array(n*n),waterKind=new Uint8Array(n*n),bridges=new Uint8Array(n*n),bases=[[10,n-11],[n-11,10],[10,10],[n-11,n-11]].map(([x,y])=>({x:(x+.5)*TILE,y:(y+.5)*TILE}));
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
 // Inland lakes feed a meandering river that reaches the coastal sea.
 const lakeCenters=[[n*.33,n*.51,Math.max(3,n*.055),Math.max(3,n*.08)],[n*.69,n*.69,Math.max(3,n*.065),Math.max(2,n*.045)]];
 for(let k=0;k<4+size*2;k++){const cx=n*(.22+hash(k,2,seed+810)*.56),cy=n*(.22+hash(k,3,seed+810)*.56);if(Math.hypot(cx-ridgeX,cy-ridgeY)<n*.12)continue;lakeCenters.push([cx,cy,Math.max(2,n*(.018+hash(k,4,seed+810)*.035)),Math.max(2,n*(.02+hash(k,5,seed+810)*.06))]);}

 for(const [cx,cy,rx,ry] of lakeCenters){for(let y=Math.max(6,Math.floor(cy-ry*1.6));y<Math.min(n-6,cy+ry*1.6);y++)for(let x=Math.max(6,Math.floor(cx-rx*1.6));x<Math.min(n-6,cx+rx*1.6);x++){const i=y*n+x;const radius=Math.hypot((x-cx)/rx,(y-cy)/ry),shore=1+(noise(x/3,y/3,seed+818)-.5)*.5+Math.sin(Math.atan2(y-cy,x-cx)*3+seed%11)*.12;if(radius<shore){tiles[i]=radius<shore*.7?0:1;height[i]=0;decor[i]=0;waterKind[i]=1;}else if(radius<shore+.16){tiles[i]=2;height[i]=0;decor[i]=0;}}}
 const riverWidth=Math.max(1.3,n*.006)*(1+hash(2,3,seed)*.5);
 for(let y=0;y<n;y++){const cx=n*.33+Math.sin((y-n*.51)/(n*(.09+hash(3,4,seed)*.06)))*n*.065+(noise(y/12,1,seed+777)-.5)*n*.05;for(let x=Math.max(0,Math.floor(cx-riverWidth-1));x<=Math.min(n-1,Math.ceil(cx+riverWidth+1));x++){const i=y*n+x,d=Math.abs(x-cx);if(d<=riverWidth){tiles[i]=d<riverWidth*.6?0:1;height[i]=0;decor[i]=0;if(!waterKind[i])waterKind[i]=2;}else if(tiles[i]>=2){tiles[i]=2;height[i]=0;decor[i]=0;}}}
 // A tributary joins the second lake to the main river.
 for(let x=Math.floor(n*.27);x<=Math.ceil(n*.7);x++){const cy=n*.69+Math.sin((x-n*.69)/(n*.1))*n*.025;for(let y=Math.floor(cy-1.5);y<=Math.ceil(cy+1.5);y++){const i=y*n+x;if(y>5&&y<n-6){tiles[i]=1;height[i]=0;decor[i]=0;if(!waterKind[i])waterKind[i]=2;}}}
 // Secondary rivers vary with the seed and connect interior lakes to different coasts.
 for(let x=0;x<n;x++){const cy=n*(.22+hash(1,8,seed)*.07)+Math.sin(x/(n*.13)+hash(2,8,seed)*6)*n*.035,width=1.2+noise(x/8,1,seed+91)*Math.max(1,n*.005);for(let y=Math.max(0,Math.floor(cy-width));y<=Math.min(n-1,Math.ceil(cy+width));y++){const i=y*n+x;if(Math.abs(y-cy)>width)continue;tiles[i]=1;height[i]=0;decor[i]=0;waterKind[i]=2;}}
 // Lake archipelagos have a full water ring and flat, wooded islands for naval landings.
 const islands=[];
 for(let k=0;k<1+Math.min(3,size);k++){const cx=Math.floor(n*(k===0?.58:.3+hash(k,20,seed)*.4)),cy=Math.floor(n*(k===0?.64:.35+hash(k,21,seed)*.35)),outer=Math.max(4,n*.055),inner=Math.max(1.7,n*.017);if(k&&(Math.hypot(cx-ridgeX,cy-ridgeY)<n*.14||islands.some(p=>Math.hypot(p.x/TILE-.5-cx,p.y/TILE-.5-cy)<outer*2.1)))continue;
 for(let y=Math.floor(cy-outer-1);y<=cy+outer+1;y++)for(let x=Math.floor(cx-outer-1);x<=cx+outer+1;x++){if(x<6||y<6||x>=n-6||y>=n-6)continue;const i=y*n+x,distance=Math.hypot((x-cx),(y-cy)*1.08),coast=outer*(1+(noise(x/3,y/3,seed+k)-.5)*.15);if(distance<coast){tiles[i]=distance>coast-1?1:0;height[i]=0;decor[i]=0;waterKind[i]=1;}if(distance<inner){tiles[i]=distance>inner-.7?2:4;height[i]=0;decor[i]=distance<inner-.7&&hash(x,y,seed)>.4?1:0;waterKind[i]=0;}}
 islands.push({x:(cx+.5)*TILE,y:(cy+.5)*TILE,radius:inner*TILE});}
 // Guaranteed land corridors and flat landing zones keep every seed playable.
 const roads=[10,n-11];for(let y=6;y<n-6;y++)for(let x=6;x<n-6;x++){const i=y*n+x;if(roads.some(v=>Math.abs(x-v)<=1||Math.abs(y-v)<=1)){if(tiles[i]<=1){tiles[i]=9;bridges[i]=1;}else tiles[i]=8;height[i]=0;decor[i]=0;}}
 for(const b of bases){const bx=Math.floor(b.x/TILE),by=Math.floor(b.y/TILE);for(let y=by-4;y<=by+4;y++)for(let x=bx-4;x<=bx+4;x++){const i=y*n+x;if(x>=6&&y>=6&&x<n-6&&y<n-6){tiles[i]=3;waterKind[i]=0;bridges[i]=0;height[i]=0;decor[i]=hash(x,y,seed+512)>.7?4:0;}}}
 const map={n,w:n*TILE,h:n*TILE,size,seed:seedText,tiles,height,decor,variant,waterKind,bridges,bases,islands,lakeCenters,cache:new Map(),resources:[]};
 for(const b of bases){for(let j=0;j<5;j++)addResource(map,b.x-150+(j%3)*55,b.y+105+Math.floor(j/3)*55,'mineral');addResource(map,b.x+170,b.y-90,'gas');}
 for(let y=16;y<n-15;y+=9)for(let x=16;x<n-15;x+=9){const i=y*n+x;if(passable(map,x,y,'ground')&&tiles[i]!==8&&hash(x,y,seed+99)>.35){addResource(map,(x+.5)*TILE,(y+.5)*TILE,hash(x,y,seed+101)>.8?'gas':'mineral');}}
 for(const isle of islands)addResource(map,isle.x-45,isle.y,'mineral');
 // Every tree is a finite selectable resource. Keep mineral IDs stable for starting workers.
 for(const b of bases){const bx=Math.floor(b.x/TILE),by=Math.floor(b.y/TILE);for(const [dx,dy] of [[-3,-2],[-2,-3],[-3,-3]]){const i=(by+dy)*n+bx+dx;if(tiles[i]>=2&&tiles[i]!==6){decor[i]=1;}}}
 map.treeNodes=new Int32Array(n*n);map.treeNodes.fill(-1);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;if(decor[i]===1){const capacity=5000+Math.floor(hash(x,y,seed+205)*5001);const node={id:map.resources.length,x:(x+.5)*TILE,y:(y+.5)*TILE,kind:'wood',cell:i,capacity,amount:capacity};map.treeNodes[i]=node.id;map.resources.push(node);}}
 const fishSpots=[];
 function fishAt(x,y){const i=cell(map,x,y);if(i<0||tiles[i]>1||fishSpots.some(r=>Math.hypot(r.x-x,r.y-y)<100))return;const capacity=5000+Math.floor(hash(Math.floor(x),Math.floor(y),seed+501)*5001);fishSpots.push({x,y});map.resources.push({id:map.resources.length,x,y,kind:'fish',capacity,amount:capacity});}
 for(let y=2;y<n-2;y+=5)for(let x=2;x<n-2;x+=5)if(tiles[y*n+x]<=1&&hash(x,y,seed+511)>.35)fishAt((x+.5)*TILE,(y+.5)*TILE);
 for(const b of bases){const p=waterNear(map,b.x,b.y,12);if(p)fishAt(p.x,p.y);}
 // Offshore reserves: separate gas vents in open sea and inland lakes.
 const offshore=[];
 function gasAt(tx,ty){const x=(tx+.5)*TILE,y=(ty+.5)*TILE,i=ty*n+tx;if(tx<1||ty<1||tx>=n-1||ty>=n-1||tiles[i]>1||bridges[i])return false;
 if(![[-1,-1],[1,-1],[1,1],[-1,1]].every(([dx,dy])=>tiles[(ty+dy)*n+tx+dx]<=1))return false;
 if(fishSpots.some(r=>Math.hypot(r.x-x,r.y-y)<105)||offshore.some(r=>Math.hypot(r.x-x,r.y-y)<240))return false;
 const capacity=5000+Math.floor(hash(tx,ty,seed+905)*5001);offshore.push({x,y});map.resources.push({id:map.resources.length,x,y,kind:'gas',aquatic:true,capacity,amount:capacity});return true;}
 // Guarantee at least one open-sea and one lake reserve before scattered vents.
 for(const kind of [0,1]){let done=false;for(let y=2;y<n-2&&!done;y++)for(let x=2;x<n-2&&!done;x++)if(waterKind[y*n+x]===kind)done=gasAt(x,y);}
 for(let y=3;y<n-3;y+=9)for(let x=3;x<n-3;x+=9)if(hash(x,y,seed+906)>.3)gasAt(x,y);
 // Water components keep fishers from trying to unload into a different lake.
 map.waterRegion=new Int32Array(n*n);let region=0;const queue=new Int32Array(n*n);
 for(let i=0;i<n*n;i++)if((tiles[i]<=1||bridges[i])&&!map.waterRegion[i]){region++;let head=0,tail=1;queue[0]=i;map.waterRegion[i]=region;while(head<tail){const at=queue[head++],x=at%n,y=Math.floor(at/n);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,j=yy*n+xx;if(xx>=0&&yy>=0&&xx<n&&yy<n&&!map.waterRegion[j]&&(tiles[j]<=1||bridges[j])){map.waterRegion[j]=region;queue[tail++]=j;}}}}
 return map;
 }
 function addResource(m,x,y,kind){const i=cell(m,x,y);if(i<0||m.tiles[i]<2||m.tiles[i]===6||m.bridges[i])return;if(kind==='gas'){const cx=Math.floor(x/TILE),cy=Math.floor(y/TILE),cells=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=(cy+dy)*m.n+cx+dx;if(!passable(m,cx+dx,cy+dy,'ground')||m.bridges[j])return;cells.push(j);}for(const j of cells){m.height[j]=0;m.decor[j]=0;}}const capacity=5000+Math.floor(hash(Math.floor(x),Math.floor(y),seedNumber(m.seed))*5001);m.decor[i]=0;m.height[i]=0;m.tiles[i]=3;m.resources.push({id:m.resources.length,x,y,kind,capacity,amount:capacity});}
 function cell(m,x,y){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);return tx<0||ty<0||tx>=m.n||ty>=m.n?-1:ty*m.n+tx;}
 function elevation(m,x,y){const i=cell(m,x,y);return i<0?0:m.height[i]*14;}
 function project(m,x,y,z=0){return {x:(x-y)*.75+m.h*.75,y:(x+y)*.375-z};}
 function unproject(m,x,y){return {x:y/.75+(x-m.h*.75)/1.5,y:y/.75-(x-m.h*.75)/1.5};}
 function pick(m,x,y){let result=null;for(let level=0;level<=7;level++){const p=unproject(m,x,y+level*14),i=cell(m,p.x,p.y);if(i>=0&&m.height[i]===level)result=p;}return result||unproject(m,x,y);}
 function passable(m,x,y,domain='ground'){if(x<0||y<0||x>=m.n||y>=m.n)return false;if(domain==='air')return true;const t=m.tiles[y*m.n+x];return domain==='sea'?t<=1||!!m.bridges[y*m.n+x]:t>=2&&t!==6;}
 function waterNear(m,x,y,radius=3){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);let best=null,bd=Infinity;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(passable(m,tx+dx,ty+dy,'sea')){const p={x:(tx+dx+.5)*TILE,y:(ty+dy+.5)*TILE},d=Math.hypot(x-p.x,y-p.y);if(d<bd){best=p;bd=d;}}return best;}
 function segment(m,a,b,domain){let previous=cell(m,a.x,a.y);const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/20));for(let i=0;i<=steps;i++){const xx=a.x+(b.x-a.x)*i/steps,yy=a.y+(b.y-a.y)*i/steps,index=cell(m,xx,yy);if(!passable(m,Math.floor(xx/TILE),Math.floor(yy/TILE),domain)||domain==='ground'&&previous>=0&&Math.abs(m.height[index]-m.height[previous])>1)return false;previous=index;}return true;}
 // Binary-heap A*: complete paths for land and sea, cached for nearby formation members.
 function path(m,start,end,domain='ground'){if(domain==='air')return [{x:end.x,y:end.y}];const sx=Math.floor(start.x/TILE),sy=Math.floor(start.y/TILE),ex=Math.floor(end.x/TILE),ey=Math.floor(end.y/TILE);if(!passable(m,ex,ey,domain))return null;const key=[sx,sy,ex,ey,domain].join(':');if(m.cache.has(key))return m.cache.get(key)?.map(p=>({...p}));if(segment(m,start,end,domain))return [{x:end.x,y:end.y}];
 const n=m.n,total=n*n,g=new Float32Array(total);g.fill(Infinity);const prev=new Int32Array(total);prev.fill(-1);const closed=new Uint8Array(total),heap=[];const heuristic=(x,y)=>Math.hypot(ex-x,ey-y);function push(i,f){let j=heap.length;heap.push({i,f});while(j){const p=(j-1)>>1;if(heap[p].f<=f)break;heap[j]=heap[p];j=p;}heap[j]={i,f};}function pop(){const root=heap[0],last=heap.pop();if(heap.length){let j=0;while(j*2+1<heap.length){let c=j*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[j]=heap[c];j=c;}heap[j]=last;}return root.i;}
 const origin=sy*n+sx,target=ey*n+ex;if(origin<0||origin>=total)return null;g[origin]=0;push(origin,heuristic(sx,sy));let found=false;
 while(heap.length){const i=pop();if(closed[i])continue;if(i===target){found=true;break;}closed[i]=1;const x=i%n,y=Math.floor(i/n);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,yy=y+dy;if(!passable(m,xx,yy,domain)||dx&&dy&&(!passable(m,x+dx,y,domain)||!passable(m,x,y+dy,domain)))continue;const j=yy*n+xx;if(closed[j]||domain==='ground'&&Math.abs(m.height[j]-m.height[i])>1)continue;const cost=g[i]+(dx&&dy?1.414:1)*(m.tiles[j]===4?1.2:1);if(cost<g[j]){g[j]=cost;prev[j]=i;push(j,cost+heuristic(xx,yy));}}}
 if(!found){if(m.cache.size>128)m.cache.clear();m.cache.set(key,null);return null;}const result=[];for(let i=target;i!==origin&&i>=0;i=prev[i])result.push({x:(i%n+.5)*TILE,y:(Math.floor(i/n)+.5)*TILE});result.reverse();if(m.cache.size>128)m.cache.clear();m.cache.set(key,result);return result.map(p=>({...p}));
 }
 const colors=['#123847','#235f68','#b1a279','#456b49','#34573f','#797d6c','#929486','#638456','#81785b','#8a8167'];
 function polygon(g,pts,c){g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(Math.round(p[0]),Math.round(p[1])):g.moveTo(Math.round(p[0]),Math.round(p[1])));g.closePath();g.fill();}
 function tile(g,m,x,y,time,visibility=2){const i=y*m.n+x,t=m.tiles[i],z=visibility?m.height[i]*14:0,p=project(m,x*TILE,y*TILE,z),sx=p.x,sy=p.y;const pts=[[sx,sy],[sx+48,sy+24],[sx,sy+48],[sx-48,sy+24]];
 if(z){polygon(g,[[sx-48,sy+24],[sx,sy+48],[sx,sy+48+z],[sx-48,sy+24+z]],'#485344');polygon(g,[[sx,sy+48],[sx+48,sy+24],[sx+48,sy+24+z],[sx,sy+48+z]],'#343f38');for(let h=7;h<z;h+=9){g.strokeStyle='#71806b66';g.beginPath();g.moveTo(sx-45,sy+25+h);g.lineTo(sx,sy+46+h);g.lineTo(sx+45,sy+25+h);g.stroke();}}
 polygon(g,pts,visibility===0?'#101e2a':colors[t]);if(!visibility)return;
 const v=m.variant[i];for(let j=0;j<(t<2?16:38);j++){const u=hash(j,v,43),w=hash(j,v,89),px=sx+(u-w)*43,py=sy+(u+w)*22;g.fillStyle=t<2?(j%3?'#49858a55':'#a1c9bd44'):t===2?(j%2?'#e2cf9a88':'#716e4c55'):j%3?'#a4b87944':'#142f3044';g.fillRect(Math.round(px),Math.round(py),t<2?8:2+j%3,1+(j%2));}
 if(t>=2){for(let j=0;j<3;j++){const u=hash(j,v,315),w=hash(j,v,419),xx=sx+(u-w)*31,yy=sy+8+(u+w)*16;polygon(g,[[xx-9,yy],[xx-3,yy-4],[xx+6,yy-3],[xx+12,yy+2],[xx+2,yy+5],[xx-7,yy+4]],t===2?'#d4bd8540':t===5?'#a4aa8e33':t===8?'#4c503433':'#8aa15a22');}if(t===3||t===4||t===7)for(let j=0;j<5;j++){const u=hash(j,v,911),w=hash(j,v,121),xx=sx+(u-w)*40,yy=sy+(u+w)*22;g.strokeStyle=j%2?'#a8ba7255':'#213e3555';g.beginPath();g.moveTo(xx-2,yy-3);g.lineTo(xx,yy);g.lineTo(xx+2,yy-4);g.stroke();}}
 if(t<=1){for(const [dx,dy,edge] of [[1,0,[[sx+48,sy+24],[sx,sy+48]]],[0,1,[[sx,sy+48],[sx-48,sy+24]]],[-1,0,[[sx-48,sy+24],[sx,sy]]],[0,-1,[[sx,sy],[sx+48,sy+24]]]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<m.n&&yy<m.n&&m.tiles[yy*m.n+xx]>=2){g.strokeStyle='#c2ddbd99';g.lineWidth=2;g.beginPath();g.moveTo(...edge[0]);g.lineTo(...edge[1]);g.stroke();}}}
 if(t<2){const phase=(time*.6+v/50)%1;g.strokeStyle=t===1?'#b7dfc699':'#72acb444';g.lineWidth=1;g.beginPath();g.moveTo(sx-20+phase*15,sy+25);g.lineTo(sx-6+phase*15,sy+28);g.moveTo(sx+10,sy+15+phase*10);g.lineTo(sx+23,sy+18+phase*10);g.stroke();}
 if(t===9){for(let k=0;k<7;k++){const xx=sx-38+k*12,yy=sy+24-Math.abs(k-3)*2;polygon(g,[[xx,yy-5],[xx+7,yy-2],[xx+7,yy+4],[xx,yy+1]],'#b6a580');}g.strokeStyle='#d0bc91';g.lineWidth=2;g.beginPath();g.moveTo(sx-44,sy+19);g.lineTo(sx,sy+41);g.lineTo(sx+44,sy+19);g.stroke();}
 if(visibility===1)polygon(g,pts,'#08142599');
 }
 function decoration(g,m,x,y,time){const i=y*m.n+x,type=m.decor[i];if(!type)return;const p=project(m,(x+.5)*TILE,(y+.5)*TILE,m.height[i]*14),v=m.variant[i];const r=(xx,yy,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(p.x+xx),Math.round(p.y+yy),w,h);};
 if(type===1&&v%3===0){r(-14,2,40,8,'#142c2866');r(-3,-40,6,42,'#615a39');r(-1,-35,2,35,'#a38b56');for(let j=0;j<5;j++){const xx=p.x+(j-2)*8,yy=p.y-34-Math.sin(j)*13;polygon(g,[[xx-19,yy],[xx-14,yy-16],[xx+3,yy-22],[xx+20,yy-10],[xx+19,yy+5],[xx,yy+14]],j%2?'#3f7048':'#527c4b');for(let k=0;k<10;k++){g.fillStyle=k%3?'#acc57966':'#173b3455';g.fillRect(xx+(hash(k,j,v)-.5)*30,yy+(hash(k,j,v+9)-.5)*24,3,2);}}}
 else if(type===1){const tall=35+v%30,wind=Math.sin(time*.7+v)*1.5;r(-14,2,37,7,'#122e2866');r(-3,-tall+12,6,tall-10,'#574f36');r(-1,-tall+13,2,tall-10,'#97835a');for(let j=0;j<4;j++){const yy=p.y-tall+j*10,ww=13+j*6;polygon(g,[[p.x+wind,yy-16],[p.x-ww,yy+14],[p.x+ww,yy+14]],j%2?'#315f40':'#244d37');polygon(g,[[p.x+wind,yy-16],[p.x-ww,yy+14],[p.x-2,yy+8]],'#508254');for(let k=0;k<6;k++)r((hash(k,j,v)-.5)*ww*1.4,-tall+j*10+hash(k,2,v)*14,3,2,'#82a56b88');}}
 else if(type===2||type===3){const h=type===3?50+v%45:12+v%15,w=type===3?36:18;polygon(g,[[p.x-w,p.y],[p.x-4,p.y-h],[p.x+w,p.y-4],[p.x+9,p.y+9]],'#737d70');polygon(g,[[p.x-4,p.y-h],[p.x+5,p.y-h*.35],[p.x+w,p.y-4],[p.x+9,p.y+9]],'#46594f');polygon(g,[[p.x-w,p.y],[p.x-4,p.y-h],[p.x+5,p.y-h*.35]],'#9ca591');if(type===3)polygon(g,[[p.x-4,p.y-h],[p.x-13,p.y-h*.65],[p.x-3,p.y-h*.72],[p.x+6,p.y-h*.55]],'#d2d6b9');for(let j=0;j<9;j++)r(-10+hash(j,v,3)*22,-h*.65+hash(j,v,9)*h*.65,3,2,'#c4c5a655');}
 else if(type===5){r(-7,-3,14,7,'#6f583d');r(-5,-5,10,4,'#c1a575');r(-1,-4,2,3,'#755e43');}
 else{for(let j=0;j<6;j++){r(-14+j*5,Math.sin(j)*5,1,4+j%3,'#9bad67');if(j%2)r(-14+j*5,Math.sin(j)*5,3,2,v%2?'#d8b07d':'#c6c99a');}}
 }
 function resource(g,n,time){const p={x:n.x,y:n.y};g.save();g.translate(p.x,p.y);if(n.kind==='fish'){for(let i=0;i<5;i++){const xx=Math.sin(time*.6+i*1.3)*17,yy=Math.cos(time*.8+i)*9;polygon(g,[[xx-6,yy],[xx+3,yy-3],[xx+7,yy],[xx+3,yy+3]],i%2?'#9ac9c4':'#cbdaca');polygon(g,[[xx-5,yy],[xx-10,yy-3],[xx-10,yy+3]],'#86b9c0');}g.strokeStyle='#c4e3d077';g.beginPath();g.ellipse(0,0,27+Math.sin(time)*2,13,0,0,7);g.stroke();}
 else{
 const seed=(n.id||0)*97+Math.floor(n.capacity||7000),rnd=(i,j=0)=>hash(i,j,seed),richness=Math.max(0,Math.min(1,(n.amount??n.capacity??1)/(n.capacity||1)));
 const dot=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
 // Rock faces share a fixed light direction but each deposit has a different silhouette.
 function rock(x,y,w,h,tint=false){
 const left=[x-w,y-2],tip=[x-w*.23,y-h],back=[x+w*.47,y-h*.76],right=[x+w,y-3],front=[x+w*.18,y+6],lower=[x-w*.63,y+4];
 polygon(g,[left,tip,back,right,front,lower],tint?'#456267':'#515950');
 polygon(g,[left,tip,[x+w*.05,y-h*.38],lower],tint?'#65838a':'#969b86');
 polygon(g,[tip,back,right,[x+w*.05,y-h*.38]],tint?'#789d9e':'#b0b19a');
 polygon(g,[[x+w*.05,y-h*.38],right,front,lower],tint?'#294f59':'#606a60');
 polygon(g,[lower,front,[x+w*.08,y+9],[x-w*.6,y+7]],tint?'#203f48':'#35443c');
 g.strokeStyle=tint?'#a8c9c055':'#d1cdb366';g.lineWidth=1;g.beginPath();g.moveTo(...tip);g.lineTo(x+w*.05,y-h*.38);g.lineTo(...lower);g.stroke();
 for(let j=0;j<10;j++){const xx=x+(rnd(j,Math.round(x)+20)-.5)*w*1.1,yy=y-h*.45+rnd(j,Math.round(y)+35)*h*.4;dot(xx,yy,1+j%2,1,j%3?'#1c303144':'#d4d1af66');}
 }
 if(n.kind==='mineral'){
 polygon(g,[[-33,0],[-23,-13],[4,-17],[27,-8],[35,5],[16,16],[-16,16]],'#253b3377');
 polygon(g,[[-29,1],[-19,-9],[5,-12],[25,-5],[28,6],[9,13],[-19,11]],'#766e54');
 for(let i=0;i<12;i++){const a=rnd(i,1)*Math.PI*2,r=23+rnd(i,2)*10;rock(Math.cos(a)*r,Math.sin(a)*r*.4,2+rnd(i,3)*2,2+rnd(i,4)*3);}
 const chunks=[[-15,-3,13,17],[5,-7,15,25],[20,3,11,15],[-7,7,15,20]];
 chunks.forEach(([xx,yy,ww,hh],i)=>{const x=xx+(rnd(i,8)-.5)*5,y=yy,h=hh*(.8+rnd(i,9)*.4);rock(x,y,ww,h);
 // Fractured blue-grey ore seams embedded in the host rock, rather than crystal pillars.
 if(richness>0){polygon(g,[[x-ww*.58,y-h*.46],[x-ww*.2,y-h*.7],[x+ww*.08,y-h*.48],[x+ww*.52,y-h*.57],[x+ww*.67,y-h*.43],[x+ww*.05,y-h*.29],[x-ww*.24,y-h*.48],[x-ww*.58,y-h*.31]],richness>.25?'#58a6b5':'#4b7780');
 dot(x-ww*.2,y-h*.56,3,2,'#b0d4ce');dot(x+ww*.28,y-h*.46,2,1,'#b9d6ca');
 for(let j=0;j<Math.ceil(richness*5);j++){const px=x+(rnd(j,i+50)-.5)*ww,py=y-h*.22+rnd(j,i+65)*h*.25;polygon(g,[[px,py-3],[px+3,py-4],[px+5,py],[px+1,py+2]],j%2?'#69aab6':'#3d8295');dot(px+1,py-2,1,2,'#bdded7');}}
 });
 }else if(n.kind==='gas'){
 const wet=!!n.aquatic;
 polygon(g,[[-32,0],[-23,-11],[0,-17],[27,-9],[33,3],[19,15],[-14,16]],wet?'#153f4888':'#313c2e99');
 polygon(g,[[-25,0],[-15,-10],[7,-12],[24,-3],[22,8],[1,12],[-20,8]],wet?'#2a5556':'#8b8058');
 polygon(g,[[-20,0],[-10,-7],[8,-8],[19,-1],[10,7],[-10,6]],wet?'#102f3b':'#29362d');
 // Broken rim, mineral staining and hairline fissures around the vent.
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9+.2,x=Math.cos(a)*(22+rnd(i,31)*3),y=Math.sin(a)*10;rock(x,y,4+rnd(i,32)*3,3+rnd(i,33)*5,wet);if(!wet)dot(x-1,y-3,3,1,'#bdaf73');}
 for(let i=0;i<5;i++){const a=i*1.3+.4,x=Math.cos(a)*12,y=Math.sin(a)*5;g.strokeStyle=wet?'#183f48':'#1b2d2c';g.beginPath();g.moveTo(x*.3,y*.3);g.lineTo(x,y);g.lineTo(x*1.7+3,y*1.7);g.stroke();}
 if(richness>0&&wet){
 // Rising bubbles and expanding surface ripples identify a submerged gas seep.
 for(let i=0;i<7;i++){const phase=(time*(.27+rnd(i,41)*.13)+rnd(i,42))%1,x=(rnd(i,43)-.5)*23+Math.sin(time+i)*2,y=5-phase*26,r=1+phase*2;g.strokeStyle='#a9d6ca'+(phase>.8?'44':'aa');g.lineWidth=1;g.beginPath();g.ellipse(Math.round(x),Math.round(y),r,r*.7,0,0,7);g.stroke();dot(x-1,y-1,1,1,'#d0e9d3');}
 for(let i=0;i<2;i++){const a=(time*.35+i*.5)%1;g.strokeStyle=a>.7?'#7eb7ad33':'#8cc7bb77';g.beginPath();g.ellipse(0,0,10+a*24,4+a*11,0,.3,2.6);g.stroke();g.beginPath();g.ellipse(0,0,10+a*24,4+a*11,0,3.5,5.7);g.stroke();}
 }else if(richness>0){
 // Low, translucent vapor emerges from the dark fissure and drifts with the wind.
 for(let i=0;i<7;i++){const a=(time*.25+i/7)%1,x=-3+a*10+Math.sin(i*2+time*.7)*3,y=-2-a*35,w=3+a*10;polygon(g,[[x-w,y],[x-w*.7,y-w*.45],[x,y-w*.7],[x+w*.8,y-w*.25],[x+w,y+2],[x+w*.2,y+w*.45],[x-w*.6,y+w*.3]],a>.75?'#bdc6a414':a>.4?'#b8c5a32b':'#d2d6ae44');}
 }
 }
 }g.restore();}

 return {TILE,SIZES,generate,cell,elevation,project,unproject,pick,passable,waterNear,segment,path,tile,decoration,resource,colors,hash};
})();
