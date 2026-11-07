'use strict';
globalThis.PixelModels = (() => {
 function draw(ctx,e,f,time,building=false,ghost=false){
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  const line=(x,y,xx,yy,c,width=2)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x),Math.round(y));ctx.lineTo(Math.round(xx),Math.round(yy));ctx.stroke();};
  const diamond=(x,y,w,h,c)=>{for(let row=0;row<h;row+=2){const n=Math.max(2,w*(1-Math.abs(row-h/2)/(h/2)));r(x-n/2,y+row,n,2,c);}};
  const c=f.color,l=f.light,d=f.dark,metal='#78909a',shade='#12202c',rim=e.team?['','#fb9478','#f7c36b','#f28ac2'][e.team]:'#e0f8c1';
  const phase=(e.walk||0)*.16,bob=e.moving?Math.round(Math.sin(phase)*1.5):0,heading=Math.round((e.facing||0)/(Math.PI/4))*Math.PI/4,recoil=(e.flash||0)*14;
  ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));if(ghost)ctx.globalAlpha=.55;
  r(-e.size-3,e.size*.55,e.size*2+6,7,'#07131b88');
  if(building){
   const size=e.size,progress=e.build?1-e.build/e.buildTotal:1;
   r(-size-4,-size*.65,size*2+8,size*1.5,shade);r(-size,-size*.6,size*2,size*1.4,d);
   for(let x=-size+6;x<size;x+=12)r(x,size*.7,6,3,rim);
   if(e.build){
    for(let x=-size;x<=size;x+=16){r(x,-size-14,2,size*1.85,'#526873');line(x,-size+2,x+16,size*.7,'#304a54',1);}
    r(-size-5,-size-16,size*2+10,4,metal);r(-size-5,-size-12,size*2+10,3,'#d3b879');
    ctx.save();ctx.beginPath();ctx.rect(-size-10,size*.85-(size*2+30)*progress,size*2+20,(size*2+30)*progress);ctx.clip();
   }
   if(e.type==='core'){
    r(-43,-37,86,63,shade);r(-39,-42,78,59,metal);r(-33,-36,66,42,d);r(-28,-32,56,12,c);r(-27,-13,54,15,shade);for(let i=0;i<5;i++)r(-23+i*10,-10,6,7,l);
    for(const sign of [-1,1]){r(sign<0?-54:39,-15,15,44,d);r(sign<0?-51:42,-11,9,14,c);r(sign<0?-51:42,17,9,7,metal);}r(-16,18,32,19,shade);r(-12,20,24,4,c);r(30,-65,3,23,metal);r(28,-68,7,5,Math.sin(time*3)>0?l:c);
   }else if(e.type==='barracks'){
    r(-35,-30,70,55,shade);r(-31,-37,62,43,metal);r(-27,-33,54,12,c);r(-25,-15,50,41,d);r(-18,-10,36,36,shade);for(let i=0;i<5;i++)r(-15,-7+i*6,30,3,metal);r(-32,24,64,5,rim);for(const x of [-30,24]){r(x,-16,6,28,c);r(x,-19,6,3,l);}
   }else if(e.type==='depot'){
    r(-27,-25,54,43,metal);r(-23,-29,46,10,c);r(-23,-15,46,30,d);for(let y=0;y<3;y++){r(-19,-12+y*9,38,5,shade);r(-16,-11+y*9,5,2,metal);}r(-29,18,58,5,c);
   }else if(e.type==='refinery'){
    for(const x of [-24,5]){r(x,-28,20,49,metal);r(x+3,-34,14,9,c);r(x+4,-22,12,33,shade);r(x+6,-17+Math.sin(time*2+x)*3,8,25,'#bde185');r(x+6,-16,3,10,'#efffc3');}r(-8,8,16,20,d);r(-5,12,10,5,c);r(23,-8,8,4,metal);
    for(let i=0;i<3;i++){const age=(time*.4+i*.33)%1;r(-20+i*15,-37-age*24,5+age*8,4+age*6,'#95bbb533');}
   }else if(e.type==='factory'){
    r(-40,-33,80,59,metal);r(-35,-38,70,13,c);r(-31,-18,62,47,d);r(-23,-12,46,41,shade);for(let i=0;i<4;i++)r(-19+i*11,7,6,18,metal);r(-46,-24,14,34,d);r(-44,-32,10,9,c);r(29,-57,12,28,metal);r(27,-61,16,5,c);r(-16,-8,32,7,c);
   }else if(e.type==='turret'){
    r(-20,-12,40,30,metal);r(-16,-16,32,22,d);ctx.save();ctx.rotate(heading);r(-12,-10,24,20,c);r(-8,-7,16,14,metal);r(2-recoil,-4,29,8,shade);r(12-recoil,-3,17,5,metal);r(27-recoil,-5,6,10,c);ctx.restore();
   }
   // Each faction has a distinct architectural silhouette, not just a tint.
   if(f.style==='organic'){for(const sign of [-1,1]){diamond(sign*(size-4),-size*.6,16,26,d);diamond(sign*(size-4),-size*.7,9,22,c);}for(let i=0;i<3;i++){r(-14+i*12,-size*.5,7,5,l);line(-size+5,size*.65,-size-11,size*.8,c);}}
   if(f.style==='crystal'){diamond(0,-size-22,24,40,d);diamond(0,-size-26,14,34,c);diamond(-2,-size-23,5,23,l);for(const x of [-size+5,size-5]){diamond(x,-size*.4,12,25,c);r(x-3,size*.5,6,4,l);}}
   if(e.build){ctx.restore();const scan=size*.8-(size*1.8)*((time*.45)%1);r(-size,scan,size*2,2,'#b9eff080');if(e.constructing){const sx=Math.sin(time*7)*size*.7,sy=-size*.5+Math.cos(time*9)*size*.3;for(let i=0;i<5;i++){const a=time*15+i*1.3;r(sx+Math.cos(a)*i*3,sy+Math.sin(a)*i*3,2,2,i%2?'#fff1b0':'#ffa362');}}}
   else{for(let i=0;i<3;i++)r(-size+8+i*7,size*.58,3,3,(Math.floor(time*3)+i)%3?d:l);}
  }else{
   ctx.save();ctx.translate(0,bob);
   if(f.style==='industrial'){
    if(e.type==='worker'){
     ctx.rotate(heading);for(const sy of [-1,1]){r(-11,sy<0?-12:7,22,5,shade);for(let j=0;j<4;j++)r(-10+j*6-(e.moving?Math.floor(phase)%3:0),sy<0?-11:8,3,3,metal);}
     r(-12,-8,23,16,d);r(-9,-7,15,14,c);r(-6,-5,8,9,metal);r(-4,-4,7,3,l);r(5,-4,10,8,shade);r(12,-6,5,3,metal);r(12,3,5,3,metal);r(-14,-4,4,8,'#e5bb72');
    }else if(e.type==='marine'){
     const stride=e.moving?Math.sin(phase)*4:0;r(-9,6+stride,6,9,shade);r(3,6-stride,6,9,shade);r(-10,12+stride,7,3,metal);r(3,12-stride,7,3,metal);
     ctx.rotate(heading);r(-8,-10,15,20,shade);r(-7,-8,14,16,c);r(-7,-13,9,6,metal);r(-7,7,9,6,metal);r(-9,-6,9,12,d);r(-4,-6,10,12,metal);r(0,-5,7,10,c);r(4,-4,3,8,l);r(3-recoil,4,21,5,shade);r(15-recoil,3,10,4,metal);r(-10,-4,3,8,'#e5bb72');
    }else{
     ctx.rotate(heading);for(const y of [-19,11]){r(-24,y,46,9,shade);for(let j=0;j<7;j++)r(-22+j*6-(e.moving?Math.floor(phase)%4:0),y+2,3,5,metal);}r(-22,-12,41,24,d);r(-19,-10,35,20,c);r(-17,-7,10,14,metal);r(10,-7,8,14,shade);r(-5,-11,20,22,d);r(-4,-9,16,18,metal);r(-2,-6,8,12,c);r(4-recoil,-4,32,8,shade);r(9-recoil,-3,25,5,metal);r(30-recoil,-5,7,10,c);r(-20,-6,3,3,l);r(-20,3,3,3,l);
    }
   }else if(f.style==='organic'){
    ctx.rotate(heading);const large=e.type==='tank',size=large?22:e.type==='worker'?12:15;
    for(let i=0;i<3;i++)for(const sign of [-1,1]){const x=-size+6+i*size*.6,wave=e.moving?Math.sin(phase+i*1.5)*4:Math.sin(time*2+i)*1;line(x,sign*6,x-5+wave,sign*(size+3),shade,4);line(x-5+wave,sign*(size+3),x+2+wave,sign*(size+5),c,2);}
    diamond(-3,-size*.7,size*2,size*1.4,d);diamond(-4,-size*.65,size*1.6,size*1.3,c);for(let i=0;i<3;i++)r(-size+5+i*6,-size*.45,3,size*.9,d);diamond(size-6,-8,16,16,metal);r(size-1,-5,5,3,l);r(size-1,2,5,3,l);
    if(e.type==='tank'){diamond(1,-11,20,22,'#dae796');r(6-recoil,-4,28,8,d);r(18-recoil,-3,14,6,c);r(29-recoil,-2,5,4,l);}else{line(size,-6,size+5,-10,c,3);line(size,6,size+5,10,c,3);}if(e.type==='worker')r(-size,-4,6,8,'#7ed8df');
   }else{
    ctx.translate(0,Math.sin(time*3+e.id)*2);ctx.rotate(heading);const size=e.type==='tank'?23:e.type==='worker'?12:16;
    for(const sign of [-1,1]){diamond(-3,sign<0?-size-3:4,size*1.5,size*.7,d);diamond(-1,sign<0?-size:6,size,size*.55,c);r(-size-2,sign<0?-size+4:size-3,4+(e.moving?Math.floor(time*12)%4:0),3,'#a1eaff');}
    diamond(0,-size*.75,size*1.8,size*1.5,d);diamond(0,-size*.6,size*1.3,size*1.2,c);diamond(2,-size*.35,size*.65,size*.7,l);r(-size+1,-3,5,6,'#73cce2');
    if(e.type==='tank'){r(4-recoil,-4,28,8,d);diamond(28-recoil,-7,15,14,c);diamond(30-recoil,-4,9,8,l);}else if(e.type==='marine'){r(8-recoil,-8,15,3,l);r(8-recoil,5,15,3,l);}else{r(11,-2,7,4,l);}
   }
   if(e.flash>0){const tip=e.type==='tank'?37:26;ctx.fillStyle='#fff6c7';ctx.fillRect(tip,-4,8,8);ctx.fillStyle=c;ctx.fillRect(tip+7,-2,5,4);}
   ctx.restore();
   r(-5,e.size+6,10,2,rim);if(e.carry){diamond(-2,-21,10,13,'#68d9ed');r(-3,-19,3,7,'#e5ffff');}
   if(e.working){const angle=time*12,xx=16+Math.sin(angle)*3;line(9,2,xx,-8,c,2);r(xx,-11,4,4,'#fff2b0');for(let i=0;i<3;i++)r(xx+Math.cos(angle+i)*8,-10+Math.sin(angle+i)*7,2,2,'#f5bd71');}
  }
  ctx.restore();
 }
 return {draw};
})();
