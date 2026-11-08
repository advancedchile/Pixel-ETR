'use strict';
// Hand-built isometric voxel models. World-facing geometry is projected before drawing.
globalThis.PixelModels=(()=>{
 function constructionStage(e){const progress=Math.max(0,Math.min(1,1-(e.build||0)/(e.buildTotal||1))),index=progress<.2?0:progress<.45?1:progress<.72?2:progress<1?3:4;return {progress,index,label:['Cimientos','Armazón','Instalaciones','Revestimiento y pruebas','Terminada'][index]};}

 function draw(g,e,f,time,building=false,ghost=false){
 const angle=building&&!['turret','dock'].includes(e.type)?0:Math.round((e.facing||0)/(Math.PI/4))*Math.PI/4,co=Math.cos(angle),si=Math.sin(angle),phase=(e.walk||0)*.16,step=e.moving?Math.sin(phase)*3:0,air=['fighter','bomber','interceptor','gunship'].includes(e.type),sea=['patrol','cruiser','fisher','torpedo','transport'].includes(e.type),hover=air?35+Math.sin(time*3+e.id)*2:f.style==='crystal'&&!building?5+Math.sin(time*2+e.id)*2:0;
 const c=f.color,l=f.light,d=f.dark,steel='#7d929c',dark='#253943',trim=e.team?['','#ff9a81','#f3c77d','#ef9fcf'][e.team]:'#d7efaa';
 g.save();g.translate(Math.round(e.x),Math.round(e.y));if(ghost)g.globalAlpha=.55;
 const p=(x,y,z=0)=>{const xx=x*co-y*si,yy=x*si+y*co;return [Math.round((xx-yy)*.75),Math.round((xx+yy)*.375-z-hover)];};
 function poly(points,color,outline=false){g.fillStyle=color;g.beginPath();points.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();if(outline){g.strokeStyle='#12232b88';g.lineWidth=1;g.stroke();}}
 const face=(pts,color)=>poly(pts.map(q=>p(...q)),color,true);
 function box(x,y,z,w,h,depth,top=steel,left=d,right=dark,detail=false){const faces=[{pts:[[x,y,z],[x+w,y,z],[x+w,y,z+depth],[x,y,z+depth]],c:left},{pts:[[x+w,y,z],[x+w,y+h,z],[x+w,y+h,z+depth],[x+w,y,z+depth]],c:right},{pts:[[x+w,y+h,z],[x,y+h,z],[x,y+h,z+depth],[x+w,y+h,z+depth]],c:left},{pts:[[x,y+h,z],[x,y,z],[x,y,z+depth],[x,y+h,z+depth]],c:right}];faces.sort((a,b)=>a.pts.reduce((s,q)=>s+p(q[0],q[1])[1],0)-b.pts.reduce((s,q)=>s+p(q[0],q[1])[1],0));for(const v of faces)face(v.pts,v.c);face([[x,y,z+depth],[x+w,y,z+depth],[x+w,y+h,z+depth],[x,y+h,z+depth]],top);
 if(detail){for(let xx=4;xx<w-3;xx+=8)for(let yy=4;yy<h-3;yy+=8){const pt=p(x+xx,y+yy,z+depth+.5);g.fillStyle=(xx+yy)%3?'#d5dfc333':'#15252f44';g.fillRect(pt[0],pt[1],2,1);}for(let xx=4;xx<w-3;xx+=10){const pt=p(x+xx,y+h,z+depth*.55);g.fillStyle='#bdc7bf88';g.fillRect(pt[0],pt[1],2,2);}}}
 function crystal(x,y,z,w,h){face([[x-w,y,z],[x,y-w,z],[x,y,z+h]],l);face([[x,y-w,z],[x+w,y,z],[x,y,z+h]],c);face([[x+w,y,z],[x,y+w,z],[x,y,z+h]],d);face([[x,y+w,z],[x-w,y,z],[x,y,z+h]],c);}
 function pipe(x,y,z,length){box(x,y,z,length,4,4,steel,d,d);for(let i=3;i<length;i+=8)box(x+i,y-.5,z-.5,2,5,5,'#afb6aa',dark,dark);}
 function vent(x,y,z,w,h){box(x,y,z,w,h,1,dark,dark,dark);for(let i=2;i<h;i+=4)box(x+1,y+i,z+1,w-2,1,1,steel,d,d);}
 function glow(x,y,z,w=5){const pt=p(x,y,z);g.fillStyle=c;g.fillRect(pt[0]-w/2,pt[1]-2,w,3);g.fillStyle=l;g.fillRect(pt[0]-1,pt[1]-2,2,2);}
 function barrel(x,y,z,length){const recoil=(e.flash||0)*15;box(x-recoil,y,z,length,5,5,steel,dark,d);box(x+length-5-recoil,y-1,z-1,6,7,7,c,d,d);}
 const radius=building?e.size:sea?32:e.size+5;poly([[-radius,3],[0,-radius*.4],[radius,3],[0,radius*.55]],'#071c2388');
 if(building){
 const s=e.size*.72;
 box(-s-7,-s-7,0,(s+7)*2,(s+7)*2,4,'#53646a','#344349','#283942',true);
 for(let a=-s;a<s;a+=12){box(a,s+3,4,6,4,1,trim,d,d);box(s+3,a,4,4,6,1,trim,d,d);}
 if(e.build){
 // An independent construction model: no clipping or revealing of the final building.
 const phase=constructionStage(e),q=phase.progress,workTime=e.constructing?time:q*20,roof=e.type==='core'?43:e.type==='turret'?28:e.type==='dock'?27:34;
 const beam='#a4a993',rust='#76634e',safety='#d8b277';
 // Marked foundation, reinforcement grid and material stockpiles.
 for(let i=0;i<6;i++){const x=-s+3+i*(s*2-6)/6;box(x,-s+3,4,2,s*2-6,2,steel,d,d);if(q>(i+1)*.025)box(x,-s+3,6,(s*2-6)/6-2,s*2-6,2,'#71817b','#4c605b',dark);}
 for(let i=0;i<Math.max(1,4-Math.floor(q*4));i++){box(-s-10,s-4-i*10,4,10,8,7,rust,dark,d,true);box(s+5,-s+i*9,4,13,6,2,beam,d,d);}
 // Each structural member is installed in sequence.
 const anchors=[[-s,-s],[0,-s],[s,-s],[s,0],[s,s],[0,s],[-s,s],[-s,0]],posts=Math.min(8,Math.max(0,Math.floor((q-.2)/.25*9)));
 for(let i=0;i<posts;i++){const [x,y]=anchors[i];box(x-2,y-2,7,4,4,roof-7,beam,dark,d);box(x-4,y-4,7,8,8,2,steel,d,d);}
 if(q>.35){box(-s,-s,roof,s*2,3,3,beam,d,d);box(-s,s-3,roof,s*2,3,3,beam,d,d);}
 if(q>.42){box(-s,-s,roof,3,s*2,3,beam,d,d);box(s-3,-s,roof,3,s*2,3,beam,d,d);box(-2,-s,roof,4,s*2,3,steel,d,d);}
 // Internal equipment stays exposed while technicians assemble the exterior.
 if(q>=.45){
 const installed=Math.min(1,(q-.45)/.27);
 if(e.type==='refinery'||e.type==='aquaticRefinery'){
 for(let i=0;i<2;i++){box(-s+4+i*s,-s+5,8,s-7,s*1.3,10+Math.floor(installed*3)*4,steel,dark,d,true);if(installed>.4)pipe(-s+6,s-7,12,s*1.5);}if(e.type==='aquaticRefinery')for(const x of [-s-7,s])box(x,-s-7,-6,7,s*2+14,10,steel,dark,d);
 }else if(e.type==='dock'){
 for(let i=0;i<Math.ceil(installed*7);i++)box(-s+i*s*2/7,-s,8,s*2/7-2,s*2,3,'#a18d6d',rust,d);box(-s+3,-s+3,11,s-5,18,12,steel,dark,d);
 }else if(e.type==='turret'){
 box(-12,-12,8,24,24,8,steel,dark,d);box(-6,-6,16,12,12,8,dark,d,d);if(installed>.65)box(-s+3,0,9,s*1.7,5,5,beam,d,d);
 }else{
 box(-s+6,-s+6,8,s*.8,s*.8,10+Math.floor(installed*3)*3,steel,dark,d,true);vent(-s+8,-s+8,30,s*.6,s*.6);if(installed>.3)pipe(-s+6,s-12,10,s*1.6);if(installed>.6)box(3,-s+5,8,s-9,s*1.25,14,dark,d,d,true);
 }
 }
 // Separate wall panels and incomplete roof plates, with open seams until handover.
 if(q>=.72){const panels=Math.min(7,Math.floor((q-.72)/.28*8));for(let i=0;i<panels;i++){const side=i<4,x=side?-s+2+i*s/2:s-2,y=side?s-2:-s+2+(i-4)*s/2;box(x,y,8,side?s/2-3:3,side?3:s/2-3,roof-12,i%3?steel:c,dark,d,true);}
 if(q>.84)for(let i=0;i<Math.floor((q-.84)/.16*4);i++)box(-s+4+i*s/2,-s+4,roof+3,s/2-4,s*1.1,2,steel,d,d,true);
 if(q>.94){glow(-s+5,s+1,roof-6,5);box(s-10,-s+6,roof+4,6,6,5,c,d,d);}
 }
 // Temporary scaffolding and a working crane remain until 100% completion.
 for(const x of [-s-5,s+5]){box(x,-s-5,4,2,2,roof+22,beam,dark,d);box(x,s+5,4,2,2,roof+9,beam,dark,d);}
 box(-s-5,-s-5,roof+25,s*2+12,3,3,safety,rust,d);box(-s-5,s+5,roof*.6,s*2+12,5,2,rust,d,d);
 const hookX=Math.sin(workTime*.8)*s*.5,hookZ=roof+12+Math.sin(workTime*1.2)*4;
 const wireA=p(hookX,-s-4,roof+25),wireB=p(hookX,-s-4,hookZ);g.strokeStyle='#c7d0bf';g.lineWidth=1;g.beginPath();g.moveTo(...wireA);g.lineTo(...wireB);g.stroke();box(hookX-5,-s-7,hookZ-3,10,6,3,steel,d,d);
 if(e.constructing){const pt=p(s*Math.sin(workTime*.9)*.7,s+1,8+q*(roof-8));for(let i=0;i<8;i++){g.fillStyle=i%2?'#fff4ba':'#e9a15e';g.fillRect(pt[0]+Math.cos(workTime*13+i)*i*2,pt[1]+Math.sin(workTime*13+i)*i*2,2,2);}}
 g.restore();return;
 }

 if(e.type==='core'){
 box(-s,-s,4,s*2,s*2,29,steel,dark,d,true);box(-s+5,-s+5,33,s*2-10,s*2-10,8,c,d,d,true);box(-20,-20,41,40,40,9,steel,d,d,true);vent(-15,-14,51,28,23);for(const y of [-s-4,s-10])box(-s+8,y,9,s*2-16,12,16,steel,d,d,true);pipe(-s,-s-2,16,s*2);for(let i=0;i<5;i++)glow(-s+8+i*12,s+.1,24,6);box(s-10,-s+6,41,3,3,31,steel,d,d);glow(s-9,-s+7,73,Math.sin(time*3)>0?5:2);box(-10,s,5,20,15,12,dark,d,d);vent(-7,s+2,18,14,10);
 }else if(e.type==='barracks'){
 box(-s,-s,4,s*2,s*2,22,steel,dark,d,true);box(-s+3,-s+3,26,s*2-6,s*2-6,5,c,d,d,true);box(-s+7,-s+4,31,18,18,10,steel,d,d);vent(-s+9,-s+2,42,14,14);box(-15,s-1,5,30,4,18,dark,dark,dark);for(let i=0;i<5;i++)box(-13,s+2,6+i*3,26,2,1,steel,d,d);glow(0,s+4,24,12);pipe(-s+4,-s-3,13,s*2-8);
 }else if(e.type==='factory'||e.type==='airfield'){
 box(-s,-s,4,s*2,s*2,18,steel,dark,d,true);box(-s+4,-s+4,22,s*2-8,s*2-8,6,c,d,d,true);vent(-s+6,-s+6,29,24,18);for(let i=0;i<3;i++)pipe(-s+6,-s+29+i*6,29,s*1.5);box(s-12,-s+5,28,9,9,30,steel,d,d,true);box(s-14,-s+3,58,13,13,3,dark,d,d);box(-18,s,5,36,4,14,dark,d,d);for(let i=0;i<4;i++)glow(-13+i*9,s+2,12,4);
 if(e.type==='airfield'){box(-23,-20,30,46,40,2,dark,d,d);face([[-15,-13,33],[15,-13,33],[15,13,33],[-15,13,33]],'#677d85');box(-12,-2,34,24,4,1,l,d,d);box(-2,-12,34,4,24,1,l,d,d);}
 }else if(e.type==='dock'){
 for(let i=0;i<6;i++)box(-s+i*10,-s,4,8,s*2,4,'#8d8065','#5f5b4d','#44483f',true);box(-s,-s,8,s,25,26,steel,d,d,true);vent(-s+3,-s+3,35,s-6,19);box(s-8,-s,8,4,4,58,steel,d,d);box(-8,-s,63,s,4,4,c,d,d);pipe(-s+4,s-8,10,s*1.7);for(let i=0;i<4;i++)glow(-s+i*16,s-1,9,4);
 }else if(e.type==='depot'){
 for(let i=0;i<3;i++){box(-s+i*14,-s,4,12,s*2,18,steel,d,d,true);box(-s+i*14+2,-s+2,22,8,s*2-4,3,c,d,d);}pipe(-s,s+2,12,s*2);
 }else if(e.type==='refinery'||e.type==='aquaticRefinery'){
 if(e.type==='aquaticRefinery'){for(const x of [-s-7,s-1])box(x,-s-8,-5,8,s*2+16,9,'#819aa0',dark,d);for(const [x,y] of [[-s,-s],[s,s]]){box(x-3,y-3,3,6,6,54,steel,d,d);glow(x,y,58,5);}box(-s,-s,55,s*2,4,4,c,d,d);pipe(-s,s+3,5,s*2);}
 for(const x of [-s+3,4]){box(x,-s+3,4,18,s*1.4,27,steel,d,d,true);box(x+3,-s+6,31,12,s*1.4-6,4,c,d,d);for(let j=0;j<4;j++)glow(x+9,s*.45,10+j*5,6);}pipe(-s+2,s*.55,10,s*2-4);box(-4,s*.55,4,8,10,18,c,d,d);for(let i=0;i<4;i++){const pt=p(-s+10+i*10,-s+10,38+(time*10+i*8)%28);g.fillStyle='#afc7a655';g.fillRect(pt[0],pt[1],5+i,4+i);}
 }else if(e.type==='turret'){
 box(-15,-15,4,30,30,12,steel,d,d,true);box(-9,-9,16,18,18,12,c,d,d,true);barrel(0,-3,25,34);glow(-5,-6,29);
 }
 if(f.style==='organic'){for(const sign of [-1,1]){box(sign*s-5,-s+3,8,10,s*1.7,12,c,d,d,true);for(let i=0;i<4;i++)crystal(sign*s,-s+i*12,20,4,11);}pipe(-s,s-4,12,s*2);}
 if(f.style==='crystal'){crystal(0,0,40,13,28);for(const [x,y] of [[-s,-s],[s,s]])crystal(x,y,9,7,25);}
 if(e.level>1){box(s-9,s-9,26,15,15,9,trim,d,d,true);crystal(s-2,s-2,35,4,10);}
 if(e.research){const pt=p(0,0,67);g.strokeStyle=l;g.strokeRect(pt[0]-14,pt[1]+Math.sin(time*4)*4,28,4);}

 }else{
 if(sea){const len=['cruiser','transport'].includes(e.type)?48:34,w=e.type==='transport'?23:e.type==='cruiser'?19:e.type==='torpedo'?10:13;face([[-len,-w,2],[len-8,-w,2],[len+8,0,2],[len-8,w,2],[-len,w,2]],d);face([[-len,-w,2],[len-8,-w,2],[len+8,0,2],[len-8,-w,12],[-len,-w,12]],dark);box(-len+5,-w+3,7,len*1.55,w*2-6,8,steel,d,d,true);box(-14,-w+3,15,23,w*2-6,11,c,d,d,true);vent(-12,-w+5,27,17,10);box(-8,-3,26,3,3,21,steel,d,d);if(e.type==='transport'){box(-20,-16,15,47,32,3,dark,d,d);for(let i=0;i<4;i++){box(-16+i*10,-12,18,7,24,5,'#a89b7b',d,d,true);}box(28,-15,13,9,30,3,c,d,d);for(let i=0;i<Math.min(4,(e.cargo||[]).length);i++)box(-13+i*10,-8,24,6,16,6,steel,d,d);}else if(e.type==='torpedo'){for(const sy of [-12,8]){box(0,sy,14,30,5,5,steel,d,d);glow(29,sy+2,18,4);}}else if(e.type==='fisher'){box(4,-8,15,13,16,7,'#bca375',d,d,true);pipe(10,0,25,19);if(e.working){for(let j=0;j<4;j++){const a=p(14,-15+j*7,3),b=p(40,-15+j*7,0);g.strokeStyle='#d3d8b888';g.lineWidth=1;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();}for(let j=0;j<4;j++){const a=p(14+j*8,-16,3),b=p(14+j*8,9,0);g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();}}}else barrel(11,-3,17,26);if(e.type==='cruiser')barrel(-29,-3,17,22);for(let i=0;i<3;i++){const q=p(-len-7-i*10,Math.sin(time*5+i)*8,0);g.fillStyle='#c4e0c888';g.fillRect(q[0],q[1],9,2);}}
 else if(air){const large=e.type==='bomber'||e.type==='gunship',w=e.type==='interceptor'?16:large?34:25;face([[-20,-5,8],[-30,-w,8],[9,-w,8],[24,0,8],[9,w,8],[-30,w,8],[-20,5,8]],d);face([[-21,-4,10],[-26,-w+4,10],[6,-w+4,10],[17,0,10],[6,w-4,10],[-26,w-4,10],[-21,4,10]],c);box(-24,-6,9,43,12,9,steel,d,d,true);box(4,-5,18,12,10,5,l,c,d);for(const sign of [-1,1]){box(-28,sign*w*.7-4,6,24,8,9,steel,d,d,true);const q=p(-31,sign*w*.7,10);g.fillStyle='#92e7f4';g.fillRect(q[0]-5,q[1],7+Math.floor(time*20)%5,3);}if(e.type==='interceptor'){box(14,-3,13,18,6,5,steel,d,d);glow(-28,0,12,12);}if(e.type==='gunship'){for(const sy of [-22,17])barrel(9,sy,10,25);box(-18,-10,16,25,20,6,steel,d,d,true);}if(large){box(-10,-w+7,2,24,6,6,dark,d,d);box(-10,w-13,2,24,6,6,dark,d,d);}}
 else if(e.type==='bike'){
 for(const x of [-18,15]){box(x,-6,0,9,12,10,dark,d,d);box(x+2,-7,3,5,14,4,steel,d,d);}box(-15,-5,9,34,10,6,c,d,d,true);box(-7,-5,15,12,10,10,steel,d,d);box(-4,-4,25,8,8,7,c,d,d);glow(3,0,29,4);barrel(8,-3,15,23);box(-21,-4,10,8,8,4,dark,d,d);
 }else if(e.type==='worker'){
 for(const sy of [-12,7]){box(-15,sy,0,29,6,6,dark,d,d);for(let j=0;j<5;j++)box(-13+j*5+(e.moving?Math.floor(phase)%3:0),sy,5,2,6,1,steel,d,d);}box(-13,-8,6,24,16,11,steel,d,d,true);box(-8,-6,17,13,12,5,c,d,d,true);box(-5,-4,22,7,8,2,l,c,d);pipe(9,-2,12,14);box(18,-7,8,4,4,6,steel,d,d);box(18,4,8,4,4,6,steel,d,d);box(-17,-4,7,6,8,8,'#c6a477',d,d);
 }else if(['marine','elite','grenadier','sniper'].includes(e.type)){
 const heavy=e.type==='elite';box(-4,-9+step,0,9,6,9,dark,d,d);box(-4,3-step,0,9,6,9,dark,d,d);box(-5,-9+step,9,7,6,8,steel,d,d);box(-5,3-step,9,7,6,8,steel,d,d);box(-8,-8,17,16,16,13,heavy?steel:c,d,d,true);box(-10,-11,20,7,5,9,steel,d,d);box(-10,6,20,7,5,9,steel,d,d);box(-5,-5,30,10,10,9,steel,d,d,true);box(3,-4,32,3,8,4,l,c,d);box(-13,-5,19,5,10,9,dark,d,d);barrel(4,5,20,e.type==='sniper'?39:heavy?27:18);if(e.type==='sniper'){glow(8,5,27,4);box(-12,-8,17,5,16,12,'#657257',d,d);}if(e.type==='grenadier'){box(10,3,18,16,9,9,steel,d,d,true);for(let j=0;j<3;j++)box(-12,-9+j*6,17,5,4,9,'#b1a37a',d,d);}if(heavy)box(-8,-10,30,3,20,3,trim,d,d);
 }else{
 const s=e.type==='heavyTank'?1.4:e.type==='siege'?1.25:1;for(const sy of [-21,13]){box(-27*s,sy,0,50*s,8,9,dark,d,d);for(let j=0;j<10;j++)box(-25*s+j*5*s+(e.moving?Math.floor(phase)%3:0),sy,9,2,8,2,steel,d,d);}box(-24*s,-14,7,44*s,28,10,steel,d,d,true);box(-18,-11,17,31,22,8,c,d,d,true);box(-7,-8,25,19,16,9,steel,d,d,true);barrel(6,-3,29,e.type==='siege'?44:32);if(e.type==='heavyTank'){barrel(6,7,29,37);for(const sy of [-23,17])box(-26,sy,12,50,7,12,c,d,d,true);}vent(-19,-9,26,10,16);for(const sy of [-11,10])glow(19,sy,16,4);
 }
 if(f.style==='organic'&&!air&&!sea){for(let i=0;i<3;i++)for(const sign of [-1,1]){const xx=-14+i*10,yy=sign*(12+Math.sin(phase+i)*3);box(xx,yy,1,3,5,8,d,d,d);crystal(xx,sign*8,e.type==='marine'?24:20,5,8);}box(-9,-7,e.type==='marine'?22:14,17,14,4,c,d,d,true);}
 if(f.style==='crystal'&&!sea){crystal(0,0,e.type==='marine'?25:air?19:22,e.type==='tank'?9:6,13);for(const sy of [-13,13])glow(-9,sy,9,6);}
 if(e.carry){if(e.carryKind==='wood'){for(let j=0;j<3;j++)box(-15,-6+j*4,24,15,3,3,'#c19e69','#7a5e3e','#594b36');}else if(e.carryKind==='fish'){box(-20,-5,22,12,10,5,'#c1ae8a',d,d,true);glow(-16,0,28,5);}else{crystal(-12,-2,25,5,10);glow(-12,-2,31,3);}}
 if(e.working){const q=p(23,0,12);for(let i=0;i<6;i++){g.fillStyle=i%2?'#d6faff':'#f5c47b';g.fillRect(q[0]+Math.cos(time*17+i)*i*2,q[1]+Math.sin(time*17+i)*i*2,2,2);}}
 if(e.flash>0){const q=p(sea?43:air?27:e.type==='tank'?40:26,0,sea?19:air?12:24);poly([[q[0],q[1]-6],[q[0]+15,q[1]],[q[0],q[1]+6]],'#fff0a5');}
 glow(-e.size,0,2,6);
 }
 g.restore();
 }
 return {draw,constructionStage};
})();
