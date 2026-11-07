# Pixel ETR — Frontera de ceniza

Un juego de estrategia en tiempo real en español, con gráficos pixel art originales y una escaramuza contra la IA. Inspirado en mecánicas clásicas del género: economía, construcción, producción, suministros y control del ejército. No incluye recursos, personajes ni código de StarCraft.

**Jugar:** https://advancedchile.github.io/Pixel-ETR/

## La misión

Dirige la Colonia Aurora y destruye el núcleo de la Legión Carmesí, situado al noreste. Protege tu núcleo: su destrucción termina la partida. Los recolectores iniciales trabajan automáticamente. La IA defiende su base y envía oleadas cada vez mayores. Elige entre Explorador, Comandante y Veterano.

## Mecánicas

- Minerales finitos: los recolectores extraen 10 por viaje y los entregan al núcleo.
- Gas: cada refinería terminada produce 1,8 unidades por segundo automáticamente.
- Suministros: núcleo 20; cada depósito añade 10; máximo 200. Las unidades en cola reservan suministros.
- Construcción: requiere un recolector que llegue a la obra. Si recibe otra orden, la obra se detiene; clic derecho sobre ella con un recolector permite continuar.
- Producción: colas de hasta cinco unidades por edificio.
- Fusileros de alcance medio, tanques resistentes con daño de área y torretas defensivas.
- Niebla de guerra, exploración persistente, minimapa y grupos de control.
- Victoria, derrota, pausa y reinicio. La partida se pausa al cambiar de ventana.

| Unidad | Minerales | Gas | Suministros | Producción |
| --- | ---: | ---: | ---: | --- |
| Recolector | 50 | 0 | 1 | Núcleo, 7 s |
| Fusilero | 60 | 0 | 1 | Cuartel, 9 s |
| Tanque Atlas | 150 | 75 | 3 | Fábrica, 19 s |

| Edificio | Minerales | Gas | Tiempo |
| --- | ---: | ---: | ---: |
| Depósito | 100 | 0 | 12 s |
| Cuartel | 150 | 0 | 18 s |
| Refinería | 125 | 0 | 15 s |
| Fábrica | 200 | 75 | 26 s |
| Torreta | 100 | 25 | 14 s |

## Controles

Pensado para ordenador con ratón y teclado.

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
| Guardar grupo / seleccionar grupo | Ctrl + 1–5 / 1–5 |
| Pausar | P |
| Ayuda completa | Botón ? |

Los botones muestran los atajos de producción y construcción. Consejos: construye pronto una refinería, mantén el cuartel produciendo y combina tanques con infantería. Las oleadas comienzan a los 160, 120 u 85 segundos, según dificultad.

## Desarrollo

Aplicación estática sin dependencias de ejecución ni proceso de compilación. Abre `index.html` directamente o sirve la carpeta con `python3 -m http.server 8000` y visita `http://localhost:8000`.

```sh
node --check game.js
node --test tests/engine.test.cjs
```

Las pruebas ejecutan el motor en Node con un DOM y canvas simulados. Cubren economía, pausa, costes, reservas de suministros, límites de cola, construcción, gas, tanques, ataque, oleadas, victoria y derrota. No sustituyen una prueba visual en navegador. GitHub Actions ejecuta estas comprobaciones en cada push y pull request.

`index.html` contiene la interfaz; `style.css`, el diseño; `game.js`, la simulación, gráficos y controles. Todos los sprites se dibujan en canvas. Las fuentes de Google son opcionales: si no cargan se usan fuentes del sistema.

## GitHub Pages

Publicación desde la raíz de la rama `main` en **Settings → Pages → Deploy from a branch**. `.nojekyll` evita procesamiento innecesario. Todos los recursos locales usan rutas relativas, compatibles con `/Pixel-ETR/`. Cada push a `main` actualiza el sitio.

## Alcance de esta versión

Una facción jugable, un mapa, tres unidades y cinco estructuras construibles. IA basada en defensas y oleadas; no simula una economía rival. Movimiento con evitación local de edificios y separación de unidades. Sin multijugador, guardado de partidas, audio, árbol de mejoras ni controles táctiles completos.
