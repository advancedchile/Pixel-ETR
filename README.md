# Pixel ETR — Frontera de ceniza

**[Jugar en GitHub Pages](https://advancedchile.github.io/Pixel-ETR/)**

Estrategia en tiempo real en español, con pixel art original, tres facciones y escaramuzas contra una coalición de una a tres IA. Sin instalación ni cuenta. Pensado para ordenador con ratón y teclado.

## Operación 02

- Sala de preparación con selección de facción, número de rivales y facción/dificultad independiente de cada IA.
- Tres familias visuales: maquinaria industrial, criaturas biomecánicas y unidades flotantes de cristal.
- Movimiento orientado en ocho direcciones, ciclos de orugas y patas, levitación, retroceso y fogonazos.
- Construcción progresiva con andamios, aparición de estructuras, escaneo y chispas de soldadura. Animaciones de minería, producción de gas y luces de edificios.
- Efectos sintetizados de selección, órdenes, movimiento, minería, construcción, producción, disparos, explosiones, oleadas y resultados. Los efectos locales solo se oyen en la zona visible cercana a la cámara.
- Banda sonora procedural **original**, con capas ambientales, bajo, percusión, arpegios y variaciones por facción. No contiene grabaciones ni melodías de StarCraft.
- Volúmenes separados para música y efectos, silencio global y pausa de audio junto con el juego. El audio comienza tras pulsar «Desplegar colonia».
- Preferencias de facción, rivales y volumen guardadas en el navegador. No se guardan partidas en curso.

## Facciones

| Facción | Estilo | Ventajas y compensaciones |
| --- | --- | --- |
| Unión Aurora | Ingeniería industrial | Construcción 15% más rápida; unidades equilibradas |
| Enjambre Verdante | Biomecánica | Unidades 25% más rápidas, producción 15% más rápida y 15% menos vida |
| Conclave Astral | Cristal y energía | Unidades con 25% más vida y 10% más daño, 15% más lentas y producción 15% más larga |

Las bonificaciones de vida, daño y velocidad afectan a las unidades móviles, no a las estructuras. Cada facción mantiene los mismos costes y suministros.

| Función | Aurora | Verdante | Astral | Minerales / gas / suministros |
| --- | --- | --- | --- | --- |
| Recolección | Ingeniero | Zángano | Sonda | 50 / 0 / 1 |
| Infantería | Explorador | Acechador | Custodio | 60 / 0 / 1 |
| Unidad pesada | Atlas | Escarabajo | Prisma | 150 / 75 / 3 |

## Objetivo y rivales

Destruye **todos** los núcleos enemigos sin perder el tuyo. Las IA son aliadas entre sí y no se atacan. Al destruir un núcleo rival, su ejército y edificios se retiran, y deja de recibir refuerzos. El radar muestra el siguiente ataque de cada rival.

| Dificultad de la IA | Primera oleada | Intervalo | Unidades de la primera oleada |
| --- | ---: | ---: | ---: |
| Explorador | 160 s | 140 s | 5 |
| Comandante | 120 s | 110 s | 6 |
| Veterano | 85 s | 75 s | 8 |

La IA 2 comienza 18 segundos después y la IA 3, 36 segundos después del tiempo de su dificultad. Las oleadas crecen de dos en dos hasta 16 unidades e incluyen una unidad pesada desde la segunda. Las posiciones iniciales de los rivales son noreste, noroeste y sureste. Más rivales supone más presión; sus dificultades se configuran por separado.

## Economía y construcción

Los seis recolectores iniciales trabajan automáticamente. Los minerales son finitos y se transportan al núcleo en lotes de diez. Cada refinería terminada genera 1,8 unidades de gas por segundo. El núcleo aporta 20 suministros y cada depósito añade diez, hasta un máximo de 200. Las colas de producción, de hasta cinco unidades, reservan suministros al encargar una unidad.

| Estructura | Minerales | Gas | Tiempo base |
| --- | ---: | ---: | ---: |
| Depósito | 100 | 0 | 12 s |
| Cuartel | 150 | 0 | 18 s |
| Refinería | 125 | 0 | 15 s |
| Fábrica | 200 | 75 | 26 s |
| Torreta | 100 | 25 | 14 s |

Aurora reduce los tiempos de construcción un 15%. Los tiempos base de producción de recolector, infantería y unidad pesada son 7, 9 y 19 segundos, modificados por la facción. La fábrica requiere un cuartel terminado. Construir necesita un recolector que llegue a la obra: darle otra orden detiene la construcción. Clic derecho sobre la obra con un recolector la reanuda.

## Controles

| Acción | Control |
| --- | --- |
| Seleccionar | Clic izquierdo |
| Seleccionar grupo | Arrastrar; Mayús añade |
| Seleccionar mismo tipo en pantalla | Doble clic |
| Mover / atacar / recolectar / reanudar obra | Clic derecho en destino |
| Atacar al avanzar | A, después clic izquierdo |
| Detener | H |
| Construir | Selecciona recolector y botón; clic en terreno libre visible |
| Cancelar colocación | Esc o clic derecho |
| Mover cámara | Flechas o clic en minimapa |
| Volver a la base | Espacio |
| Guardar / seleccionar grupo | Ctrl + 1–5 / 1–5 |
| Pausa | P |
| Silencio / volúmenes / ayuda | ♫ / ⚙ / ? |

El juego se pausa al cambiar de ventana. Los botones muestran los atajos de producción y construcción.

## Desarrollo y verificación

Aplicación estática sin dependencias de ejecución ni compilación. Abre `index.html` o sirve la carpeta con `python3 -m http.server 8000`.

```sh
node --test tests/*.test.cjs
```

- `game.js`: simulación, órdenes, IA, niebla, interfaz y minimapa.
- `factions.js`: atributos, nombres y configuración de dificultad.
- `models.js`: sprites y animación procedural en canvas.
- `lobby.js`: preparación de partidas y preferencias locales.
- `audio.js`: banda sonora y efectos con Web Audio.
- `index.html` y `style.css`: interfaz y diseño adaptable.

Las 20 pruebas verifican economía, costes, suministros, construcción, combate, partidas completas, atributos de facciones, IA independientes, alianzas, eliminación, selección de rivales, preferencias, programación de audio, pausa, silencio y ausencia de Web Audio. Usan DOM, canvas y nodos de audio simulados; no equivalen a probar interacción, presentación y mezcla sonora en un navegador real. Los sprites también se revisaron mediante renderizado de canvas. GitHub Actions ejecuta comprobaciones de sintaxis y pruebas en cada push y pull request.

## Publicación y alcance

GitHub Pages publica la raíz de `main`. `.nojekyll` evita procesamiento adicional y los recursos usan rutas relativas. Cada push a `main` actualiza el sitio. Las fuentes de Google son opcionales; existen fuentes de respaldo del sistema. Si Web Audio no está disponible, el juego continúa sin sonido.

Un mapa, tres roles de unidad y cinco estructuras construibles por facción. La IA usa defensas y refuerzos por oleadas, no una economía simulada. Movimiento con evitación local de edificios y separación entre unidades. Sin multijugador en red, guardado de partidas, árbol de mejoras ni controles táctiles completos. No incluye recursos, personajes ni código de StarCraft.
