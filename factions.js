'use strict';
// Shared by the lobby, simulation, and pixel-art renderer.
globalThis.PixelFactions = {
  aurora: {name:'Unión Aurora',short:'AURORA',color:'#79dce1',light:'#d1ffff',dark:'#315a70',hp:1,speed:1,damage:1,build:.85,production:1,style:'industrial',description:'Ingeniería de frontera',bonus:'Construcción un 15% más rápida',tradeoff:'Unidades equilibradas',names:{worker:'Ingeniero',marine:'Explorador',tank:'Atlas'}},
  verdant: {name:'Enjambre Verdante',short:'VERDANTE',color:'#b3e780',light:'#e9ffc5',dark:'#3c6750',hp:.85,speed:1.25,damage:1,build:1,production:.85,style:'organic',description:'La colonia está viva',bonus:'+25% velocidad · producción 15% más rápida',tradeoff:'Unidades con 15% menos vida',names:{worker:'Zángano',marine:'Acechador',tank:'Escarabajo'}},
  astral: {name:'Conclave Astral',short:'ASTRAL',color:'#c0a1ff',light:'#f2e8ff',dark:'#544078',hp:1.25,speed:.85,damage:1.1,build:1,production:1.15,style:'crystal',description:'Tecnología más allá del horizonte',bonus:'+25% vida y +10% daño en unidades',tradeoff:'Movimiento 15% más lento · producción 15% más larga',names:{worker:'Sonda',marine:'Custodio',tank:'Prisma'}}
};
globalThis.PixelDifficulty = {
 easy:{label:'Explorador',first:160,interval:140,count:3},
 normal:{label:'Comandante',first:120,interval:110,count:4},
 hard:{label:'Veterano',first:85,interval:75,count:6}
};
