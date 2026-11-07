# Pixel ETR — Frontera de ceniza

**[Jugar en GitHub Pages](https://advancedchile.github.io/Pixel-ETR/)**

Estrategia en tiempo real en español: tres facciones, mapas isométricos procedurales y una coalición de una a tres IA. Para ordenador con ratón y teclado. No requiere instalación ni cuenta.

## Operación 06 — Control táctico

- Proyección isométrica con elevación, orden de profundidad y zoom del 45% al 175%.
- Modelos construidos con geometría volumétrica: caras iluminadas, paneles, remaches, rejillas, tuberías, trenes de rodaje, cubiertas navales, alas, propulsores y accesorios de facción.
- Animación de marcha, orientación en ocho direcciones, movimiento de orugas, levitación, retroceso, minería, construcción con andamios y aparición progresiva, investigación y luces de actividad.
- Terreno con mar, lagos, ríos sinuosos, puentes, aguas someras, playas, dos tipos de árboles, vegetación, rocas, acantilados escalonados, valles y montañas con cumbres nevadas. Texturas, espuma, oleaje y sombras procedurales.
- Mapas generados por **semilla reproducible**, botón para generar otra semilla, vista previa y cinco tamaños.
- Depósitos minerales con roca fracturada, vetas incrustadas y fragmentos dispersos; gas terrestre con grietas, costras minerales y vapor, y gas submarino con burbujas y ondas. Siluetas distintas por depósito y menor presencia de mena al agotarse.
- Recursos seleccionables con cantidad restante y capacidad inicial. Cada depósito de minerales, gas, madera o peces contiene entre **5.000 y 10.000** unidades.
- Los trabajadores cargan **15** unidades por viaje. Se oyen perforación, extracción de gas, recogida y descarga en el núcleo.
- Diez roles de unidad: trabajador, infantería, infantería de asalto, tanque, artillería, caza, bombardero, patrullera, crucero y pesquero.
- Nueve estructuras, todas mejorables a nivel II. Las unidades avanzadas requieren la mejora en **el edificio que las produce**.
- Núcleos adicionales construibles para expandirse; los trabajadores entregan al núcleo terminado más cercano.

La partida ocupa toda la ventana, sin scroll general. La barra superior y el panel derecho se superponen al campo de batalla. Los paneles y diálogos conservan desplazamiento interno cuando hace falta. El contador de recolectores inactivos incluye trabajadores y pesqueros sin órdenes.

Todos los recolectores muestran el recurso y su carga incremental en el mundo y en la selección; dentro de una refinería, las cargas de los operarios aparecen en el panel del edificio. Minerales, gas terrestre, madera y pesca avanzan a una unidad cada 500 ms, hasta 15; el gas acuático automático conserva su tasa de 1 por segundo.

## Generación de mapas

| Tamaño | Casillas | Dimensiones del mundo | Superficie respecto a Pequeño |
| --- | --- | --- | ---: |
| Pequeño | 48 × 48 | 3.072 × 3.072 | 1× |
| Mediano | 80 × 80 | 5.120 × 5.120 | 2,78× |
| Grande | 128 × 128 | 8.192 × 8.192 | 7,11× |
| Enorme | 192 × 192 | 12.288 × 12.288 | 16× |
| Colosal | 384 × 384 | 24.576 × 24.576 | 64× |

Colosal está pensado para expediciones muy largas. Usa el minimapa, los cazas y los núcleos de expansión. Una misma semilla y tamaño producen el mismo terreno y recursos. La generación reserva zonas llanas y corredores entre las bases para garantizar conectividad terrestre, además de una costa marítima conectada.

Las unidades terrestres buscan rutas A* alrededor de agua, montañas y desniveles no transitables. Las naves solo recorren agua conectada; las aeronaves sobrevuelan el terreno. Los árboles y pequeños elementos decorativos no bloquean el movimiento. Los edificios usan evitación local y las unidades se separan entre sí. Solo se dibujan las casillas y objetos cercanos a la cámara; la generación no crea una imagen del mundo completo.

## Facciones

| Facción | Ventajas y compensaciones |
| --- | --- |
| Unión Aurora | Construcción 15% más rápida; unidades equilibradas |
| Enjambre Verdante | Unidades 25% más rápidas, producción 15% más rápida y 15% menos vida |
| Conclave Astral | Unidades con 25% más vida y 10% más daño principal, 15% más lentas y producción 15% más larga |

Las bonificaciones de vida, daño y velocidad afectan a unidades móviles, incluidas las aéreas y marítimas. Los costes y suministros son comunes a las facciones. Los nombres del trabajador, la infantería básica y el tanque cambian por facción.

## Economía

Los seis trabajadores iniciales recogen minerales automáticamente. Selecciona un depósito con clic izquierdo para consultar **restante / capacidad inicial**. Con un trabajador seleccionado, el clic derecho ordena recolectar. Cada trabajador transporta hasta 15 minerales, gas o madera, sin exceder la cantidad restante.

El gas terrestre solo se extrae dentro de una refinería construida **sobre el depósito**. La colocación se ajusta al centro de la reserva y un depósito admite una sola estructura. Envía trabajadores con clic derecho sobre la refinería: entran hasta **4 simultáneamente**; los demás esperan fuera en orden de llegada. Cada operario sale con hasta 15 de gas, lo entrega al núcleo y regresa a la cola. Una orden nueva, una baja o la destrucción del edificio libera la plaza. Cada unidad de recurso tarda **500 ms**: la carga progresa de 1 en 1 hasta 15 en 7,5 segundos. Refuerzo II aumenta la resistencia del edificio y mantiene esta cadencia.

Los océanos y lagos también tienen reservas de gas de 5.000–10.000 unidades. Selecciona un **pesquero**, pulsa **G** y coloca una **refinería acuática** sobre una reserva visible. El pesquero debe llegar y terminar la construcción. La plataforma extrae automáticamente **1 gas por segundo**, directamente al almacén, sin operarios. Se detiene al agotarse la reserva, durante la pausa o al ser destruida. Su mejora aumenta la vida, manteniendo la extracción en 1 gas/s.

Cada núcleo terminado aporta 20 suministros. Los depósitos aportan 100 o 150 en nivel II, con un máximo total de 10.000 suministros. El límite independiente de población es de **2.000 unidades propias**, incluyendo trabajadores, barcos, aeronaves y las unidades reservadas en todas las colas. Las colas de producción reservan suministros y admiten hasta cinco unidades. La construcción necesita un trabajador presente; dar otra orden pausa la obra. Clic derecho sobre la obra con un trabajador permite continuar.

Los trabajadores talan árboles con clic derecho y entregan la madera al núcleo. La madera sustituye minerales uno a uno en construcción y mejoras, y se consume primero. Los árboles agotados dejan tocones.

Entrena pesqueros en un astillero: recogen bancos de peces y descargan allí cargas de 15. El astillero debe estar conectado por agua con el banco de pesca. En el núcleo, **X** intercambia 50 peces por 75 minerales.

## Producción y tecnología

Los valores son costes y tiempos base, antes de los modificadores de facción.

| Unidad | Edificio | Nivel requerido | Minerales | Gas | Suministros | Tiempo |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Trabajador | Núcleo | I | 50 | 0 | 1 | 7 s |
| Infantería | Cuartel | I | 60 | 0 | 1 | 9 s |
| Infantería de asalto | Cuartel | II | 100 | 40 | 2 | 13 s |
| Tanque | Fábrica | I | 150 | 75 | 3 | 19 s |
| Artillería Titán | Fábrica | II | 220 | 110 | 4 | 26 s |
| Caza Cometa | Aeródromo | I | 130 | 65 | 2 | 16 s |
| Bombardero Eclipse | Aeródromo | II | 260 | 150 | 4 | 28 s |
| Pesquero Cormorán | Astillero | I | 80 | 0 | 1 | 12 s |
| Patrullera Marea | Astillero | I | 140 | 40 | 3 | 18 s |
| Crucero Leviatán | Astillero | II | 300 | 180 | 5 | 32 s |

La fábrica y el aeródromo requieren un cuartel terminado. El astillero necesita terreno junto al mar, lago o río. Las unidades navales salen al agua, las terrestres a suelo transitable y las aéreas despegan del aeródromo. Infantería, cazas, barcos y torretas pueden atacar aeronaves; tanques, artillería y bombarderos se especializan en objetivos de superficie. Tanques, artillería, bombarderos y cruceros causan daño de área sin fuego amigo.

| Estructura | Coste de construcción (minerales / gas) | Tiempo base | Mejora (minerales / gas / tiempo) | Beneficio adicional de nivel II |
| --- | --- | ---: | --- | --- |
| Núcleo | 400 / 0 | 35 s | 180 / 80 / 25 s | Trabajadores entrenados 20% más rápido |
| Depósito | 100 / 0 | 12 s | 100 / 40 / 16 s | 150 suministros en lugar de 100 |
| Cuartel | 150 / 0 | 18 s | 150 / 75 / 22 s | Infantería de asalto |
| Refinería acuática | 200 / 0 | 24 s | 150 / 60 / 24 s | +35% vida; conserva 1 gas/s |
| Refinería | 125 / 0 | 15 s | 120 / 60 / 20 s | +35% vida; conserva 500 ms por recurso |
| Fábrica | 200 / 75 | 26 s | 200 / 120 / 28 s | Artillería Titán |
| Torreta | 100 / 25 | 14 s | 130 / 80 / 20 s | +30% daño y +40 alcance |
| Aeródromo | 200 / 100 | 24 s | 220 / 140 / 30 s | Bombardero Eclipse |
| Astillero | 180 / 50 | 22 s | 200 / 120 / 28 s | Crucero Leviatán |

**Todas las mejoras añaden 35% de vida a la estructura.** Selecciona una estructura terminada y pulsa **U**. No puede investigar mientras tenga unidades en cola ni producir durante la investigación. La mejora no se comparte con otros edificios del mismo tipo.

Cada productor puede guardar su propio punto de reunión, visible como una bandera **solo mientras ese edificio está seleccionado**. Las unidades recién entrenadas van automáticamente allí; un trabajador con bandera en un árbol comienza a talarlo y un pesquero con bandera sobre un banco empieza a pescar. Las banderas navales requieren agua conectada. También puedes fijar una bandera con clic izquierdo en terreno vacío mientras está seleccionado el productor.

## Rivales y objetivo

Configura de una a tres IA, con facción y dificultad independiente. Las IA son aliadas entre sí. Destruye todos sus núcleos sin perder todos los tuyos. Al destruir el núcleo de una IA, sus unidades y edificios se retiran y dejan de llegar sus refuerzos.

| Dificultad | Primera oleada | Intervalo | Primera oleada terrestre |
| --- | ---: | ---: | ---: |
| Explorador | 160 s | 140 s | 5 |
| Comandante | 120 s | 110 s | 6 |
| Veterano | 85 s | 75 s | 8 |

La IA 2 comienza 18 segundos después y la IA 3, 36 segundos después del tiempo de su dificultad. Las oleadas crecen hasta 16 unidades y cada IA tiene un límite de 80 unidades activas para contener la acumulación en mapas grandes. Reciben tanques desde la segunda oleada; mejoran sus edificios tecnológicos desde la tercera y pueden desplegar cazas, bombarderos y fuerzas navales si conservan sus edificios correspondientes. El tiempo de viaje depende del tamaño y la ruta.

La IA usa defensas, progresión tecnológica programada y refuerzos; no simula una economía rival completa.

## Controles

| Acción | Control |
| --- | --- |
| Seleccionar unidad, edificio o recurso | Clic izquierdo |
| Seleccionar grupo | Arrastrar; Mayús añade |
| Seleccionar mismo tipo en pantalla | Doble clic |
| Mover / atacar / recolectar / reanudar obra | Clic derecho |
| Atacar al avanzar | A (cursor de espada) y clic izquierdo; Esc o clic derecho cancela |
| Recolectores inactivos | Indicador ◈ en la barra superior; clic para seleccionarlos |
| Detener | H |
| Construir | Selecciona trabajador, botón y suelo visible válido |
| Punto de reunión | Selecciona productor, Q y clic izquierdo, o clic derecho en el destino |
| Quitar bandera | Z con el productor seleccionado |
| Mejorar estructura | U |
| Cancelar colocación | Esc o clic derecho |
| Mover cámara | Flechas, cursor en los bordes del campo o arrastrar el minimapa |
| Zoom | Rueda o botones +/− |
| Volver a la base | Espacio |
| Guardar / seleccionar grupo | Ctrl + 1–0 / 1–0; máximo 40 unidades por grupo |
| Pausa | P |
| Silencio / volúmenes / ayuda | ♫ / ⚙ / ? |

La barra de grupos solo muestra grupos creados que conservan unidades vivas; desaparece si no hay ninguno.

El juego se pausa al cambiar de ventana. Los botones muestran los atajos de producción y construcción. Las preferencias se guardan localmente; las partidas en curso no.

## Audio original

Banda sonora procedural de estrategia espacial con capas ambientales, bajo, percusión, arpegios y variaciones por facción. Efectos de selección, órdenes, movimiento, extracción, construcción, producción, investigación, combate, oleadas y resultados. Los efectos locales se oyen cerca de la cámara y respetan la visibilidad. La música empieza al pulsar «Desplegar colonia». Hay volúmenes separados y silencio global.

No contiene grabaciones, melodías, modelos, personajes ni código de StarCraft.

## Desarrollo y comprobaciones

Sitio estático sin dependencias de ejecución ni compilación. Abre `index.html` o sirve la carpeta con `python3 -m http.server 8000`.

```sh
node --test tests/*.test.cjs
```

- `game.js`: simulación, IA, economía, investigación, selección y cámara isométrica.
- `terrain.js`: generación por semilla, biomas, elevación, recursos, proyección y rutas A*.
- `spatial.js`: índices por zonas para combate y separación de unidades.
- `models.js`: modelos volumétricos y animación en canvas.
- `factions.js`: atributos de facciones y dificultad.
- `lobby.js`: configuración, vista previa y preferencias.
- `audio.js`: música y efectos Web Audio.
- `index.html` / `style.css`: interfaz adaptable.

52 pruebas automatizadas cubren economía finita, carga, selección de recursos, gas, construcción, mejoras, requisitos locales de producción, navegación naval, aeronaves, IA, victorias y derrotas completas, preferencias, audio, semillas, los cinco tamaños, conectividad y selección isométrica. Se ejecutan con DOM/canvas/audio simulados; no sustituyen la revisión en un navegador real. La suite incluye tala, pesca, banderas por productor, diez grupos y reservas del límite de población, además de una simulación con 2.000 unidades activas. Las consultas espaciales y el detalle reducido de unidades lejanas o de escenas con más de 350 unidades visibles limitan el coste; no garantizan una tasa de fotogramas específica en todos los dispositivos. Se revisaron también renders del motor y de los modelos con un canvas nativo.

GitHub Actions comprueba sintaxis y pruebas. GitHub Pages publica la raíz de `main` y se actualiza con cada push. Todos los archivos usan rutas relativas. Las fuentes externas son opcionales y hay fuentes del sistema como respaldo. Sin Web Audio, el juego continúa sin sonido.

## Alcance

Escaramuza local contra IA. Sin multijugador en red, guardado de partidas ni controles táctiles completos. El relieve afecta la navegación, pero no simula balística ni oclusión de visión por montañas. Los edificios emplean evitación local; las rutas globales consideran el terreno. La apariencia es pixel art procedural isométrico.
