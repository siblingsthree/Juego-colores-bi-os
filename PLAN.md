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
| Dibujos | Tres vías: (1) **vidrieras** generadas por código a partir de siluetas libres, (2) **fotos** libres reducidas a manchas de color, (3) ilustración con IA retocada. Las tres pasan por `scripts/generar.cjs` y por el comprobador |
| Dispositivos | Tablet y móvil, en vertical y horizontal |
| Datos | Solo en el dispositivo. Sin servidor ni analítica de terceros |
| Enfoque | Diversión y creatividad. El aprendizaje formal está en nuestra otra app, Bosque de letras |
| Voz guía | Nivel 1 dice número y color ("uno, rojo"), nivel 2 el número ("dos"), nivel 3 sin voz. Suena al elegir color, al fallar y con la varita |
| Otras apps | Apps independientes. Sección "Más apps gratis" en la portada, detrás de la prueba para padres (`src/masApps.ts`) |
| Padres | "Para padres" (tras una multiplicación): editar cada perfil (animal, edad, nivel, borrar sus dibujos, borrar perfil), idioma, sonido y voz, y restablecer la aplicación. "Más apps gratis" también va detrás de la multiplicación |

## Cómo funciona el juego

1. El niño elige un color en la paleta. Las zonas que faltan de ese color se tiñen con él y llevan rayas rojas (azules si el color elegido ya es rojo, rosa, naranja o marrón).
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

## Logo e iconos

- Fuente única: `recursos/logo.svg`, una paleta de pintor con un pocillo rayado en rojo y un "1", igual que las zonas por pintar del juego.
- `npm run iconos` genera desde ella el favicon (SVG y 32 px), el icono de iPhone/iPad (180 px), los de Android (192, 512 y *maskable* 512) y `recursos/icono-1024.png` para las tiendas.
- `public/manifest.webmanifest` permite instalar la web como app ("Añadir a pantalla de inicio"), a pantalla completa.
- Al cambiar los iconos, sube el número `?v=` de los enlaces en `index.html`: Safari guarda los iconos y si no, sigue usando los viejos.
- Si cambia el nombre definitivo, hay que cambiarlo en `src/i18n.ts`, `index.html`, el manifest y `capacitor.config.ts`.

## Dibujos actuales

| Dibujo | Edad | Zonas por nivel (1 / 2 / 3 / 4) |
|---|---|---|
| Pez, casa, cohete | 3+ | 4–7 / 8–14 / 13–19 / igual que el 3 |
| Tortuga | 5+ | 5 / 21 / 32 / 40 |
| Mariposa | 7+ | 8 / 19 / 37 / 53 |
| Mandala | 10+ | 7 / 24 / 62 / 90 |
| Zorro de cristal (generado, vidriera) | 7+ | 20 / 50 / 95 / 201 |
| Ballena de cristal (generado, vidriera) | 7+ | 16 / 43 / 95 / 199 |
| Tortuga 3D y Zorro 3D (generados, foto) | 5+ / 7+ | 6 / 10 / 21 / 25 y 7 / 9 / 19 / 37 |

## Generador de dibujos (`scripts/generar.cjs`)

```bash
node scripts/generar.cjs vidriera imagen.svg zorro-vidriera "El zorro de cristal" "Glass fox" vidrieras 7
node scripts/generar.cjs foto     imagen.png  zorro-foto     "El zorro 3D"         "3D fox"    fotos     7 --fondo=#e8f1e4 --colores=12
npm run comprobar   # siempre después de generar
```

- **vidriera**: cada mancha de color del SVG se trocea en cristales con un frente de onda desde semillas bien repartidas. Los cristales se subdividen por niveles (1: ~20, 4: ~200) y los de niveles altos son zonas `oculta`, de modo que en el nivel 1 se pinta el cristal grande entero. Cada color base da hasta 3 tonos.
- **foto**: suavizado, K medias de color (solo sobre el sujeto si el PNG tiene transparencia), manchas conexas, fusión de las manchas pequeñas o finas, apertura morfológica para quitar hilos que la línea negra taparía. El nivel de cada mancha sale de su tamaño.
- Ambos: contorno vectorial con agujeros, simplificado a 1,2 px; número en el punto más interior de la parte visible; se descarta toda pieza más fina que 12 px (6 unidades), que es lo mínimo que un dedo puede pintar.
- La salida va a `src/dibujos/generados/<id>.ts` y hay que añadirla a `src/dibujos/index.ts`.
- Pendiente: probar el modo foto con fotos reales (Unsplash, Pexels). Desde el entorno de desarrollo en la nube esas webs están bloqueadas; los dos de muestra salen de PNG 3D de Fluent Emoji, que tienen poco detalle.

## Fuentes de dibujos libres

Comprobadas (accesibles desde GitHub y con licencia que permite usarlas en una app gratuita):

| Fuente | Licencia | Qué aporta |
|---|---|---|
| Fluent Emoji de Microsoft (estilo *Flat*) | MIT | ~1.500 dibujos planos de 4–20 formas. Ideal para 3–6 años |
| Twemoji (`jdecked/twemoji`) | CC BY 4.0: hay que citar la autoría | ~3.700 dibujos planos sencillos |
| OpenMoji | CC BY-SA 4.0: citar y compartir igual | Dibujos con contorno negro, parecidos a una ficha de colorear |

Para los niveles 3–4 hacen falta dibujos con mucho más detalle. Son candidatas Openclipart (dominio público) y la categoría de libros para colorear de Wikimedia Commons, pero hay que revisar la licencia de cada dibujo. Desde este entorno no se pueden descargar: hay que bajarlos a mano.

## Fases

| Fase | Contenido | Estado |
|---|---|---|
| 0. Prototipo | Pantalla de pintar, perfiles, biblioteca, 3 niveles, 3 dibujos hechos a mano, sonido, ES/EN | **Hecho** |
| 1. Herramienta de dibujos | `scripts/generar.cjs` (vidriera y foto) y `npm run comprobar`. Falta el modo para dibujos de línea de IA: detectar zonas cerradas, avisar de líneas abiertas y tomar la paleta de una referencia coloreada | **En marcha** |
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
