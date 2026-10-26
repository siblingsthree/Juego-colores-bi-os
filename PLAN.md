# Colorines (nombre provisional): plan

Juego de pintar por números para niños de 3 a 10 años, en la línea de Happy Color pero diseñado para niños.
Gratis para los niños: sin anuncios, sin compras, sin cuentas y sin recoger datos.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Tecnología | TypeScript + Vite. Web instalable y Capacitor para App Store y Google Play |
| Edades | 3–10 años, por niveles. Un perfil por niño (animal + edad) |
| Niveles | 1 (3–4 años): números dentro de un punto de su color, solo zonas grandes. 2 (5–6), 3 (7–8) y 4 (9–10): cada vez más zonas y más pequeñas. Es solo el nivel inicial: los padres lo cambian en "Para padres" |
| Subir de nivel | Automático tras 3 dibujos seguidos terminados con 2 fallos o menos |
| Idiomas | Español + inglés |
| Dibujos | Generados con IA y retocados, a través de la herramienta de dibujos (fase 1) |
| Dispositivos | Tablet y móvil, en vertical y horizontal |
| Datos | Solo en el dispositivo. Sin servidor ni analítica de terceros |
| Enfoque | Diversión y creatividad. El aprendizaje formal está en nuestra otra app, Bosque de letras |
| Voz guía | Nivel 1 dice número y color ("uno, rojo"), nivel 2 el número ("dos"), nivel 3 sin voz. Suena al elegir color, al fallar y con la varita |
| Otras apps | Apps independientes. Sección "Más apps gratis" en la portada, detrás de la prueba para padres (`src/masApps.ts`) |
| Padres | Prueba para adultos (una multiplicación) antes de borrar perfiles y, más adelante, antes de los ajustes y los enlaces externos |

## Cómo funciona el juego

1. El niño elige un color en la paleta. Las zonas de ese color se marcan con rayas del propio color.
2. Toca una zona y se pinta con una onda que sale del dedo, un sonido y una vibración.
3. **Margen de toque**: solo si el dedo cae sobre una raya o sobre una zona ya pintada, a 6 px como mucho (10 px en el nivel 1). Un toque dentro de otra zona sin pintar nunca pinta la de al lado.
4. **Un fallo no se castiga**: solo hace temblar la ficha del color y parpadear las zonas que faltan.
5. **Varita mágica ilimitada**: hace latir las zonas que faltan.
6. Al terminar: confeti, una estrella, la repetición de cómo se pintó el dibujo y la opción de pintarlo otra vez.
7. El progreso se guarda en cada toque.

## Formato de un dibujo

Las zonas se definen en `src/dibujos/*.ts`, en orden de pintado (las posteriores tapan a las anteriores):

```ts
{ id: 'cuerpo', d: '<trazado SVG>', color: 4, nivel: 1, etiqueta: [150, 200], tam?: 13 }
```

- `nivel` es el nivel mínimo en el que la zona se pinta. En niveles inferiores aparece ya pintada. Así un mismo dibujo sirve para los 3 niveles.
- `etiqueta` es el punto donde va el número o el punto de color.
- **Regla**: cada zona tiene que verse como **un solo trozo**. Si una forma queda partida por otra que va encima (por ejemplo, el cuerpo de un pez cortado por sus rayas), cada trozo debe ser una zona distinta. `npm run comprobar` lo verifica en todos los dibujos y avisa también de las zonas que quedan totalmente tapadas.

## Dibujos actuales

| Dibujo | Edad | Zonas por nivel (1 / 2 / 3 / 4) |
|---|---|---|
| Pez, casa, cohete | 3+ | 4–7 / 8–14 / 13–19 / igual que el 3 |
| Tortuga | 5+ | 5 / 21 / 32 / 40 |
| Mariposa | 7+ | 8 / 19 / 37 / 53 |
| Mandala | 10+ | 7 / 24 / 62 / 90 |

## Fases

| Fase | Contenido | Estado |
|---|---|---|
| 0. Prototipo | Pantalla de pintar, perfiles, biblioteca, 3 niveles, 3 dibujos hechos a mano, sonido, ES/EN | **Hecho** |
| 1. Herramienta de dibujos | Pasar un dibujo en PNG a JSON: detectar zonas, unir las pequeñas, avisar de líneas abiertas, sacar la paleta de una referencia coloreada, pasar a vectores (potrace), colocar números (polylabel) y página de revisión | Pendiente |
| 2. Contenido y MVP | 30–50 dibujos en 5–6 categorías, voces grabadas ES/EN, PWA sin conexión, mejor celebración | Pendiente |
| 3. Pulido | Pegatinas, paletas para daltonismo, accesibilidad, zona de padres completa, pruebas con niños | Pendiente |
| 4. Tiendas | Capacitor (iOS/Android), iconos, fichas, política de privacidad, categoría Kids (Apple) y Families (Google) | Pendiente |

## Pendiente de decidir

- Voces grabadas en lugar de la voz del sistema. En la WebView de Android la voz del sistema no suele estar disponible y hará falta un plugin de Capacitor (text-to-speech) o audios grabados.
- Nombre definitivo.
- Estilo visual de los dibujos (definir una guía antes de generar con IA).

## Desarrollo

```bash
npm install
npm run dev       # servidor local, accesible desde la tablet en la misma red
npm run build     # dist/index.html autocontenido
npx cap add ios && npx cap add android   # cuando toque la fase 4
```

## Publicación web

Cada cambio en `main` se compila y se publica en la rama `gh-pages`
(`.github/workflows/publicar.yml`): https://siblingsthree.github.io/Juego-colores-bi-os/
