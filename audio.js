'use strict';
// Original procedural score. No recordings or melodies from other games.
globalThis.PixelAudio = (() => {
 let ctx,musicBus,sfxBus,master,noise, timer=null,step=0,next=0,running=false,theme='aurora',music=.35,effects=.65,muted=false;
 const limits=new Map(),activeMusic=new Set();
 function clearScore(){if(!ctx)return;for(const source of activeMusic){try{source.stop(ctx.currentTime);}catch{}}activeMusic.clear();}
 function init(){
  if(ctx)return true;
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;
  try {ctx=new Audio();master=ctx.createGain();const limiter=ctx.createDynamicsCompressor();master.gain.value=.65;master.connect(limiter);limiter.connect(ctx.destination);musicBus=ctx.createGain();sfxBus=ctx.createGain();musicBus.connect(master);sfxBus.connect(master);
   noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   volumes();return true;
  }catch{return false;}
 }
 function volumes(){if(!ctx)return;const t=ctx.currentTime;musicBus.gain.setTargetAtTime(muted?0:music,t,.04);sfxBus.gain.setTargetAtTime(muted?0:effects,t,.04);}
 function tone(freq,start,duration,volume,type='sine',bus=musicBus,end=freq){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);o.frequency.exponentialRampToValueAtTime(Math.max(15,end),start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(bus);if(bus===musicBus)activeMusic.add(o);o.start(start);o.stop(start+duration+.02);o.onended=()=>{activeMusic.delete(o);o.disconnect();g.disconnect();};
 }
 function hiss(start,duration,volume,frequency,bus=sfxBus){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;f.type='lowpass';f.frequency.value=frequency;g.gain.setValueAtTime(volume,start);g.gain.exponentialRampToValueAtTime(.0001,start+duration);s.connect(f);f.connect(g);g.connect(bus);if(bus===musicBus)activeMusic.add(s);s.start(start);s.stop(start+duration);s.onended=()=>{activeMusic.delete(s);s.disconnect();f.disconnect();g.disconnect();};}
 function schedule(){if(!ctx||!running||ctx.state!=='running')return;const beat=60/96/2;if(next<ctx.currentTime-.5)next=ctx.currentTime+.04;while(next<ctx.currentTime+.2){
   const bar=Math.floor(step/8),phrase=Math.floor(bar/4)%4,roots=[38,34,41,36],root=roots[phrase]+(theme==='astral'?12:0),hz=n=>440*2**((n-69)/12);
   if(step%32===0){for(const offset of [0,7,14,19])tone(hz(root+offset),next,beat*30,.035,'sine');}
   if(step%2===0)tone(hz(root-12),next,beat*1.8,.12,'triangle');
   const pattern=theme==='verdant'?[0,7,12,10,7,3,14,7]:theme==='astral'?[0,14,7,19,12,7,17,10]:[0,7,10,7,12,14,7,3];
   if(bar%8>=2)tone(hz(root+12+pattern[step%8]),next,beat*.85,.045,theme==='aurora'?'triangle':'sine');
   if(step%8===0||step%8===5)tone(110,next,.18,.2,'sine',musicBus,38);
   if(step%8===4)hiss(next,.13,.075,1800,musicBus);
   if(step%2)hiss(next,.035,.025,6500,musicBus);
   // Sparse original lead phrase leaves room for battle effects.
   if(bar%8>=4&&step%4===0){const melody=[19,17,14,10,12,7,14,17];tone(hz(root+melody[Math.floor(step/4)%8]),next,beat*3.6,.045,'triangle');}
   step++;next+=beat;
  }}
 async function start(faction='aurora'){theme=faction;if(!init())return false;try{await ctx.resume();}catch{return false;}clearScore();limits.clear();running=true;step=0;next=ctx.currentTime+.08;if(timer)clearInterval(timer);timer=setInterval(schedule,80);schedule();return true;}
 function pause(value){running=!value;if(ctx){if(value){ctx.suspend().catch(()=>{});}else{next=ctx.currentTime+.05;ctx.resume().catch(()=>{});}}}
 function stop(){running=false;clearScore();if(timer){clearInterval(timer);timer=null;}}
 function sfx(kind,pan=0){if(!ctx||ctx.state!=='running'||muted||effects===0)return;const t=ctx.currentTime,min={shot:.055,tank:.12,build:.28,mine:.25,drill:.25,gasMine:.3,unload:.15,move:.1,step:.22,drive:.3}[kind]||.12;if(t-(limits.get(kind)??-10)<min)return;limits.set(kind,t);
  const p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();if(p.pan)p.pan.value=Math.max(-.8,Math.min(.8,pan));p.connect(sfxBus);setTimeout(()=>p.disconnect(),1800);
  if(kind==='shot'){hiss(t,.07,.18,3800,p);tone(750,t,.1,.11,'sawtooth',p,130);}
  else if(kind==='tank'||kind==='explode'){hiss(t,.5,.3,850,p);tone(100,t,.45,.3,'sine',p,24);}
  else if(kind==='build'){hiss(t,.1,.12,2400,p);tone(330,t,.07,.08,'square',p,170);tone(900,t+.08,.08,.035,'sine',p,600);}
  else if(kind==='step'){hiss(t,.045,.025,700,p);tone(100,t,.045,.02,'sine',p,60);}
  else if(kind==='drive'){hiss(t,.22,.035,450,p);tone(65,t,.2,.025,'triangle',p,48);}
  else if(kind==='drill'){hiss(t,.14,.12,2300,p);tone(180+Math.random()*40,t,.12,.07,'sawtooth',p,90);tone(1600,t,.05,.06,'triangle',p,1000);}
  else if(kind==='gasMine'){hiss(t,.22,.13,1700,p);tone(210,t,.18,.04,'sine',p,350);}
  else if(kind==='unload'){[700,900,1150].forEach((f,i)=>tone(f,t+i*.04,.08,.07,'triangle',p));hiss(t,.06,.05,2500,p);}
  else if(kind==='mine'){tone(1350,t,.07,.06,'triangle',p,700);hiss(t,.08,.04,3000,p);}
  else if(kind==='complete'||kind==='ready'||kind==='victory'){[440,554,659,880].forEach((f,i)=>tone(f,t+i*.1,.24,.09,'triangle',p));}
  else if(kind==='alert'||kind==='defeat'){[0,.23,.46].forEach(offset=>tone(360,t+offset,.2,.12,'sawtooth',p,240));}
  else {tone(kind==='select'?620:420,t,.1,.06,'sine',p,kind==='select'?950:660);}
 }
 return {start,pause,stop,sfx,setMusic(v){music=Math.max(0,Math.min(1,Number(v)||0));volumes();},setEffects(v){effects=Math.max(0,Math.min(1,Number(v)||0));volumes();},mute(v){muted=v;volumes();},get supported(){return !!(globalThis.AudioContext||globalThis.webkitAudioContext);}};
})();
