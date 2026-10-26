# Colorines (nombre provisional): plan

Juego de pintar por números para niños de 3 a 10 años, en la línea de Happy Color pero diseñado para niños.
Gratis para los niños: sin anuncios, sin compras, sin cuentas y sin recoger datos.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Tecnología | TypeScript + Vite. Web instalable y Capacitor para App Store y Google Play |
| Edades | 3–10 años, por niveles. Un perfil por niño (animal + edad) |
| Niveles | 1 (3–5 años): puntos de color, solo zonas grandes. 2 (6–7): números y más zonas. 3 (8–10): todas las zonas |
| Subir de nivel | Automático tras 3 dibujos seguidos terminados con 2 fallos o menos |
| Idiomas | Español + inglés |
| Dibujos | Generados con IA y retocados, a través de la herramienta de dibujos (fase 1) |
| Dispositivos | Tablet y móvil, en vertical y horizontal |
| Datos | Solo en el dispositivo. Sin servidor ni analítica de terceros |
| Padres | Prueba para adultos (una multiplicación) antes de borrar perfiles y, más adelante, antes de los ajustes y los enlaces externos |

## Cómo funciona el juego

1. El niño elige un color en la paleta. Las zonas de ese color se marcan con rayas del propio color.
2. Toca una zona y se pinta con una onda que sale del dedo, un sonido y una vibración.
3. **Margen de toque**: si el toque cae cerca (hasta 24 px) de una zona válida, cuenta.
4. **Un fallo no se castiga**: solo hace temblar la ficha del color y parpadear las zonas que faltan.
5. **Varita mágica ilimitada**: hace latir las zonas que faltan.
6. Al terminar: confeti, una estrella y la repetición de cómo se pintó el dibujo.
7. El progreso se guarda en cada toque.

## Formato de un dibujo

Las zonas se definen en `src/dibujos/*.ts`, en orden de pintado (las posteriores tapan a las anteriores):

```ts
{ id: 'cuerpo', d: '<trazado SVG>', color: 4, nivel: 1, etiqueta: [150, 200], tam?: 13 }
```

- `nivel` es el nivel mínimo en el que la zona se pinta. En niveles inferiores aparece ya pintada. Así un mismo dibujo sirve para los 3 niveles.
- `etiqueta` es el punto donde va el número o el punto de color.

## Fases

| Fase | Contenido | Estado |
|---|---|---|
| 0. Prototipo | Pantalla de pintar, perfiles, biblioteca, 3 niveles, 3 dibujos hechos a mano, sonido, ES/EN | **Hecho** |
| 1. Herramienta de dibujos | Pasar un dibujo en PNG a JSON: detectar zonas, unir las pequeñas, avisar de líneas abiertas, sacar la paleta de una referencia coloreada, pasar a vectores (potrace), colocar números (polylabel) y página de revisión | Pendiente |
| 2. Contenido y MVP | 30–50 dibujos en 5–6 categorías, voces grabadas ES/EN, PWA sin conexión, mejor celebración | Pendiente |
| 3. Pulido | Pegatinas, paletas para daltonismo, accesibilidad, zona de padres completa, pruebas con niños | Pendiente |
| 4. Tiendas | Capacitor (iOS/Android), iconos, fichas, política de privacidad, categoría Kids (Apple) y Families (Google) | Pendiente |

## Pendiente de decidir

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
