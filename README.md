<div align="center">

# 🎨 Chroma

**Selector de paletas de color con una rueda cromática interactiva.**

Elige un color base en la rueda, aplica armonías clásicas de la teoría del color
y exporta la paleta lista para usar en tu proyecto.

[**▶ Demo en vivo**](https://colors-lemon-nine.vercel.app)

</div>

---

## ✨ Características

- **Rueda cromática interactiva** (Canvas 2D, nítida en pantallas retina): haz clic en
  cualquier punto para mover el color base, o arrastra cualquier marcador para afinarlo.
- **7 armonías** generadas a partir del modelo HSL:
  análoga, complementaria, complementaria dividida, triádica, tetrádica, cuadrada y monocromática.
- **Conteo de colores ajustable**, slider de luminosidad global y **tints & shades** por color.
- **Copiar al instante** en HEX / RGB / HSL con un clic en cada muestra.
- **Exportar** la paleta como variables CSS, config de Tailwind, JSON, lista HEX, y como imagen **PNG** o **SVG**.
- **Verificador de contraste WCAG** (AA/AAA, texto normal y grande) para paletas accesibles.
- **Compartir por URL** (el estado va codificado en el enlace) y **favoritos** guardados en el navegador.
- **PWA instalable**: funciona offline y se añade a la pantalla de inicio como una app.
- Tema oscuro (`#0A0A0A`) con tipografía Geist.

## 🛠️ Stack

| Área            | Tecnología                                  |
| --------------- | ------------------------------------------- |
| Framework       | [Astro](https://astro.build) (build estático) |
| Interactividad  | [Svelte 5](https://svelte.dev) (isla única, runes) |
| Estilos         | [Tailwind CSS 4](https://tailwindcss.com) + [daisyUI 5](https://daisyui.com) |
| Color           | [colord](https://github.com/omgovich/colord) (conversiones, mezclas, a11y) |
| Animación       | Transiciones nativas de Svelte + [auto-animate](https://auto-animate.formkit.com) |
| PWA             | [@vite-pwa/astro](https://vite-pwa-org.netlify.app) + Workbox |
| Hosting         | [Vercel](https://vercel.com)                |

## 🚀 Desarrollo

Requiere [pnpm](https://pnpm.io).

```bash
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo en http://localhost:4321
pnpm dev --host   # exponerlo en la red local (para probar en el móvil)
pnpm build        # build de producción a /dist
pnpm preview      # servir el build de producción localmente
pnpm icons        # regenerar los iconos de la PWA (scripts/gen-icons.mjs)
```

## 📁 Estructura

```
src/
├─ components/
│  ├─ ColorWheel.svelte      # rueda en canvas + interacción de arrastre
│  ├─ PalettePanel.svelte    # armonías, controles, exportación, favoritos
│  ├─ Swatch.svelte          # muestra de color (copiar + tints/shades)
│  ├─ ContrastChecker.svelte # verificador WCAG
│  ├─ HarmonyIcon.svelte     # iconos SVG generados desde los ángulos de cada armonía
│  └─ ChromaApp.svelte       # composición + layout + atajo de teclado
├─ lib/
│  ├─ color.ts               # helpers de color (colord)
│  ├─ harmonies.ts           # definición y cálculo de armonías
│  ├─ export.ts              # exportaciones (CSS, Tailwind, JSON, PNG, SVG)
│  ├─ url.ts                 # estado compartible en la URL
│  ├─ store.svelte.ts        # estado global reactivo (runes)
│  └─ types.ts
├─ layouts/Layout.astro
├─ pages/index.astro
└─ styles/global.css
```

## ⌨️ Atajos

- **Barra espaciadora** — generar una paleta aleatoria.

---

<div align="center">
<sub>Construido con Astro, Svelte y un poco de teoría del color.</sub>
</div>
