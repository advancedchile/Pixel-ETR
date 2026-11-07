const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(config){
 const elements=new Map(),context=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 function element(id){if(!elements.has(id))elements.set(id,{value:'normal',textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){}},addEventListener(){},getBoundingClientRect:()=>({width:900,height:620,left:0,top:0}),getContext:()=>context,showModal(){this.open=true;},close(){this.open=false;},focus(){}});return elements.get(id);}
 let api;const sandbox={console,Math,Set,document:{getElementById:element,querySelector:()=>null},window:{addEventListener(){}},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},__PIXEL_TEST__:a=>api=a};
 vm.createContext(sandbox);for(const file of ['factions.js','models.js','audio.js','game.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../'+file),'utf8'),sandbox);if(config)api.reset(config);api.setStarted();api.step=(s)=>{for(let i=0;i<Math.ceil(s/.05);i++)api.update(.05);};api.el=element;return api;
}
test('initial economy delivers minerals; paused simulation is frozen',()=>{const a=setup();assert.equal(a.supply().used,10);a.step(25);assert.ok(a.getState().minerals>400);const t=a.getState().time;a.getState().paused=true;a.step(5);assert.equal(a.getState().time,t);a.draw();});
test('production charges once and reserves supply, then spawns a worker',()=>{const a=setup();a.train('worker');assert.equal(a.getState().minerals,350);assert.equal(a.supply().used,11);assert.equal(a.getEntities()[0].queue.length,1);a.step(8);assert.equal(a.getEntities().filter(e=>e.type==='worker').length,7);assert.equal(a.supply().used,11);});
test('insufficient resources, full queue, and supply cap block production',()=>{const a=setup();a.getState().minerals=0;a.train('worker');assert.equal(a.getEntities()[0].queue.length,0);a.getState().minerals=9999;for(let i=0;i<6;i++)a.train('worker');assert.equal(a.getEntities()[0].queue.length,5);for(let i=0;i<5;i++)a.spawn('marine',0,700+i*25,1200);a.select([a.getEntities().find(e=>e.type==='barracks'&&e.team===0).id]);a.train('marine');assert.equal(a.supply().used,20);assert.equal(a.getEntities().find(e=>e.type==='barracks'&&e.team===0).queue.length,0);});
test('construction requires clear visible land and a worker; deposits add capacity',()=>{const a=setup();assert.equal(a.validSite('depot',340,1220),false);assert.equal(a.validSite('depot',2300,1600),false);const w=a.getEntities().find(e=>e.type==='worker');a.select([w.id]);assert.ok(a.validSite('depot',400,1430));a.beginBuild('depot');a.place(400,1430);assert.equal(a.getState().minerals,300);assert.equal(a.supply().cap,20);a.step(25);assert.equal(a.supply().cap,30);assert.equal(a.getEntities().find(e=>e.type==='depot').build,0);});
test('refineries generate gas and factories produce tanks',()=>{const a=setup();a.spawn('refinery',0,700,1300);a.step(10);assert.ok(a.getState().gas>=17.9);const f=a.spawn('factory',0,800,1300);a.select([f.id]);a.getState().gas=100;a.train('tank');assert.equal(a.getState().gas,25);assert.equal(a.supply().used,13);a.step(20);assert.ok(a.getEntities().some(e=>e.type==='tank'&&e.team===0));});
test('attack move fights, waves spawn, and destroying a core ends the game',()=>{const a=setup();const marine=a.spawn('marine',0,900,900),enemy=a.spawn('marine',1,990,900);a.updateVision();a.select([marine.id]);a.orderAt(1300,900,true);a.step(1);assert.ok(enemy.hp<enemy.maxHp);a.getState().ais[0].nextWave=a.getState().time+.1;a.step(.2);assert.equal(a.getState().ais[0].wave,1);a.getEntities().find(e=>e.type==='core'&&e.team===1).hp=0;a.step(.1);assert.equal(a.getState().ended,true);assert.equal(a.el('resultTitle').textContent,'VICTORIA');});
test('base destruction produces defeat and reset restores the match',()=>{const a=setup();a.getEntities()[0].hp=0;a.step(.1);assert.equal(a.el('resultTitle').textContent,'DERROTA');a.reset();assert.equal(a.getState().ended,false);assert.equal(a.getState().minerals,400);assert.equal(a.supply().used,10);});
test('enemy assault navigates the map and can defeat an undefended colony',()=>{const a=setup();a.getState().ais[0].nextWave=.1;a.step(260);assert.ok(a.getState().ended,'an ignored enemy wave must eventually destroy the base');assert.equal(a.el('resultTitle').textContent,'DERROTA');});
test('a combined army can cross the map and destroy the enemy core',()=>{const a=setup();a.getState().ais[0].nextWave=9999;const army=[];for(let i=0;i<24;i++)army.push(a.spawn(i<8?'tank':'marine',0,650+(i%6)*40,1080+Math.floor(i/6)*40));a.updateVision();a.select(army.map(e=>e.id));a.orderAt(2040,350,true);a.step(160);assert.equal(a.getState().ended,true);assert.equal(a.el('resultTitle').textContent,'VICTORIA');});
test('all three factions apply their published unit and construction modifiers',()=>{
 const baseline=setup({faction:'aurora',ais:[{faction:'aurora',difficulty:'normal'}]});
 const bio=setup({faction:'verdant',ais:[{faction:'aurora',difficulty:'normal'}]});
 const crystal=setup({faction:'astral',ais:[{faction:'aurora',difficulty:'normal'}]});
 assert.equal(baseline.definition('depot').time,12*.85);
 assert.equal(bio.definition('marine').speed,79*1.25);assert.equal(bio.definition('marine').hp,Math.round(105*.85));assert.equal(bio.definition('marine').time,9*.85);
 assert.equal(crystal.definition('tank').hp,425);assert.equal(crystal.definition('tank').damage,44*1.1);assert.equal(crystal.definition('tank').speed,46*.85);assert.equal(crystal.definition('tank').time,19*1.15);
 for(const a of [baseline,bio,crystal]){a.step(.5);a.draw();}
});
test('three independent AI slots spawn only their own difficulty waves',()=>{
 const a=setup({faction:'aurora',ais:[{faction:'verdant',difficulty:'easy'},{faction:'astral',difficulty:'hard'},{faction:'aurora',difficulty:'normal'}]});
 assert.equal(a.getEntities().filter(e=>e.type==='core').length,4);
 const ais=a.getState().ais;assert.equal(ais[0].nextWave,160);assert.equal(ais[1].nextWave,103);assert.equal(ais[2].nextWave,156);
 a.step(104);assert.equal(ais[0].wave,0);assert.equal(ais[1].wave,1);assert.equal(ais[2].wave,0);assert.equal(ais[1].nextWave,178);assert.equal(a.getEntities().filter(e=>e.team===2&&e.type==='marine').length,13);
});
test('allied AIs do not damage one another; player can target AI 2 and AI 3',()=>{
 const a=setup({faction:'aurora',ais:[{faction:'aurora',difficulty:'normal'},{faction:'astral',difficulty:'normal'},{faction:'verdant',difficulty:'normal'}]});
 const e1=a.spawn('marine',1,900,900),e2=a.spawn('marine',2,910,900);a.step(2);assert.equal(e1.hp,e1.maxHp);assert.equal(e2.hp,e2.maxHp);assert.equal(a.hostile(e1,e2),false);
 const player=a.spawn('tank',0,800,900),third=a.spawn('marine',3,910,930);a.updateVision();a.select([player.id]);a.orderAt(third.x,third.y);assert.equal(player.order.target,third.id);a.step(1);assert.ok(third.hp<third.maxHp);
});
test('defeating one AI stops its waves; victory requires every hostile core',()=>{
 const a=setup({faction:'aurora',ais:[{faction:'verdant',difficulty:'easy'},{faction:'astral',difficulty:'normal'},{faction:'aurora',difficulty:'hard'}]});
 const cores=a.getEntities().filter(e=>e.type==='core'&&e.team);cores[1].hp=0;a.step(.1);assert.equal(a.getState().ended,false);assert.equal(a.getState().ais[1].defeated,true);assert.equal(a.getEntities().filter(e=>e.team===2).length,0);a.getState().ais[1].nextWave=0;a.step(.2);assert.equal(a.getState().ais[1].wave,0);cores[0].hp=0;a.step(.1);assert.equal(a.getState().ended,false);cores[2].hp=0;a.step(.1);assert.equal(a.el('resultTitle').textContent,'VICTORIA');
});
test('movement drives animation phase and working construction pauses without builder',()=>{
 const a=setup();const w=a.getEntities().find(e=>e.type==='worker');a.select([w.id]);a.orderAt(390,1400);a.step(.2);assert.ok(w.walk>0);assert.equal(w.moving,true);a.beginBuild('depot');a.place(400,1430);const b=a.getEntities().find(e=>e.type==='depot');a.step(3);a.draw();a.orderAt(600,1400);const progress=b.build;a.step(3);assert.equal(b.build,progress);a.orderAt(b.x,b.y);a.step(20);assert.equal(b.build,0);
});
