# Marvel Characters — Frontend Challenge

Aplicación web para explorar personajes de Marvel: búsqueda, detalle, y gestión de favoritos con persistencia. El objetivo es demostrar buenas prácticas modernas en **React + Next.js (App Router)**, **TypeScript**, **styled-components**, **tests (Jest/RTL + Cypress)**, **accesibilidad**, **performance** e **integración con la Marvel API**.

---

## ✨ Funcionalidad

**Vista principal**
- Listado inicial de 50 personajes (o resultados de búsqueda).
- Buscador por nombre con *debounce* (300 ms) y deduplicación de términos.
- Contador con número de resultados en tiempo real.
- Marcado/Desmarcado de favoritos en cada card.
- Filtro de “solo favoritos” desde el icono del header.
- Persistencia de favoritos (LocalStorage).

**Vista de detalle**
- Imagen, nombre y descripción del personaje.
- Toggle de favorito del propio personaje.
- Listado de **hasta 20 cómics** ordenados por fecha de salida.

**Navegación**
- Logotipo → vuelve al listado (resetea filtros y búsqueda).
- Icono de favoritos → alterna el filtro de favoritos.
- Accesible (roles, `aria-label`, `aria-pressed`, focus visible, etc.).

---

## 🏗️ Tecnologías y decisiones

- **Next.js (App Router, SSR/RSC)**: 
  - Detalle y cómics se obtienen en servidor para mejor *TTFB* y SEO.
  - `revalidate` configurado en las peticiones para *stale-while-revalidate* simple.
- **TypeScript**: tipado estricto, DTOs y modelos de dominio mapeados.
- **State**: 
  - **Context API** (sin Redux ni librerías de estado).
  - `CharactersContext` (data + loading + query) y `FavoritesContext` (persistido en LocalStorage).
- **UI**: **styled-components**, estilos propios (sin MUI/AntD).
- **Accesibilidad**: roles semánticos, `aria-*` en botones/contadores, focus management.
- **Performance**:
  - **`next/image` con loader propio de Marvel**: servimos **la variante óptima** según el ancho real (`portrait_*` para cómics, `standard_*` para cards).
  - `sizes` y `loading="lazy"`; `decoding="async"` donde aplica.
  - Búsqueda con *debounce* y dedup.
  - `memo`, `useCallback` y selects de contexto finos para evitar renders.
- **Testing**:
  - **Unit/Component**: Jest + React Testing Library.
  - **E2E**: Cypress (flujo completo: buscar → detalle → favorito → ver favoritos → eliminar).
  - **Fixtures**: respuestas deterministas; **SSR mockeado** en desarrollo para que el flujo sea 100% estable.
- **Calidad**:
  - ESLint (TS typed rules, Next, React Hooks, a11y, Cypress) + Prettier.
  - Config separada para Cypress (`tsconfig.cypress.json`) para evitar *parser errors*.
  - Lint rule “unsafe-to-chain-command” aplicada en Cypress (encadenados seguros).

---

## 🔐 Marvel API

- **Auth** MD5: `ts + PRIVATE_KEY + PUBLIC_KEY` → `hash`.
- **Imagenes Marvel**: la API entrega `{ path, extension }`. Construimos la URL final con **variant**:
  - *Portrait* (50×75 … 300×450): `portrait_small|medium|xlarge|fantastic|uncanny|incredible`
  - *Standard* cuadrado (65×65 … 250×250): `standard_small|medium|large|xlarge|fantastic|amazing`
- **Loader personalizado** (`src/lib/marvelImageLoader.ts`):
  - Dado un `width`, elegimos el **variant Marvel** adecuado (sin pixelar, sin sobredimensionar).
  - Evita hardcodear variantes; el server renderiza la ruta óptima.

---

## 🧪 Estrategia de tests

**Unit / RTL**
- Componentes (cards, detalle, listas), hooks (`useSearch`, `useCharacterDetail`…), utilidades (`readFixture`).
- Mocks controlados de `next/navigation`, contextos y *debounce* para tests deterministas.

**E2E / Cypress**
- **Intercept** único en cliente para búsqueda: `/api/marvel/characters?nameStartsWith=…`.
- **SSR mockeado** (detalle y cómics) mediante `MOCK_API=1` → las páginas server leen fixtures desde `cypress/fixtures` con `readFixture.ts`.
- Esperas **deterministas**:
  - `cy.wait('@search')` para la búsqueda.
  - Validaciones de URL (`cy.location('pathname'/'search')`) en cambios de ruta.
- Regla ESLint `cypress/unsafe-to-chain-command` respetada (dividimos cadenas en pasos atómicos).

---

## 🗂️ Estructura del proyecto

```
src/
  app/
    api/marvel/…        # Rutas API internas (dev/mock) y utils de fetch/SSR
    character/[id]/     # Página de detalle (SSR + Suspense cómics)
    page.tsx            # Home (listado + búsqueda)
  assets/icons/          # SVGs propios
  components/            # UI (Header, Cards, Lists, Skeletons, etc.)
  context/               # CharactersProvider, FavoritesProvider, LoaderProvider
  hooks/                 # useSearch, useFavorites, useCharacterDetail, useUrlFilters
  lib/
    api/marvel.ts        # fetch + auth MD5 + mappers DTO→dominio
    images.ts            # helpers srcset/sizes si se usan
    marvelImageLoader.ts # loader next/image → variants Marvel
    readFixture.ts       # lee fixtures desde cypress/fixtures (para SSR en mocks)
    StyledComponentsRegistry.tsx
    utils/formatters.ts  # utilidades (fechas, etc.)
  reducers/              # reducers para contextos
  styles/                # global styles, theme, variables

cypress/
  e2e/marvel.cy.ts       # flujo end-to-end
  fixtures/*.json        # fixtures Marvel (búsqueda, detalle, cómics…)
  support/e2e.ts         # hooks Cypress, filtros de errores puntuales
```

---

## ⚙️ Variables de entorno

Crea `.env.local`:

```bash
# Marvel API
MARVEL_API_BASE=https://gateway.marvel.com/v1/public
MARVEL_PUBLIC_KEY=tu_public_key
MARVEL_PRIVATE_KEY=tu_private_key

# Mock de SSR (detalle/cómics) con fixtures
# En dev para e2e: 1 → SSR lee fixtures
MOCK_API=0
```

> En **producción** `MOCK_API` debe ir a `0`. Los tests E2E arrancan el server con `MOCK_API=1` para un pipeline determinista.

---

## 🚀 Puesta en marcha

### Requisitos
- **Node 18+**
- **npm** o **pnpm** (a tu elección)

### Instalar dependencias
```bash
npm i
# o
pnpm i
```

### Desarrollo
```bash
npm run dev
```
- App en `http://localhost:3000`
- Consola limpia de warnings/errores (lint + a11y + React Hooks).

### Producción
```bash
npm run build
npm run start
```

### Tests unitarios
```bash
npm test
# o en watch:
npm run test:watch
```

### E2E (Cypress, **SSR mockeado**)
Headless:
```bash
npm run e2e
```

Interactivo:
```bash
npm run e2e:open
```

> El script e2e levanta `next dev` con `MOCK_API=1`, espera al puerto y lanza Cypress. La búsqueda se intercepta por Cypress; el detalle/comics se sirven desde fixtures en SSR.

### Lint & Format
```bash
npm run lint      # comprueba
npm run lint:fix  # corrige
npm run format    # prettier write
```

---

## 🔍 Detalles interesantes

### Búsqueda robusta (`useSearch`)
- *Debounce* de 300 ms.
- Deduplicación por término **normalizado** (trim + lower).
- Limpieza cancela timers.
- En modo **Favoritos**, filtra localmente (no dispara red).
- Etiqueta de contador siempre “Result(s)” (consistencia UI).

### Filtros y navegación
- `favorites=1` en querystring para persistencia de filtro.
- **Header**:
  - Click en logo: resetea filtros + limpia búsqueda (si ya estás en `/`).
  - Click en corazón: alterna filtro o navega a `/` con favoritos activos.

### SSR y estabilidad de test
- **SSR**: `app/character/[id]/page.tsx` crea promesas en server y las pasa al cliente; el listado de cómics se resuelve con `Suspense`.
- **Mocks SSR**: con `MOCK_API=1`, las rutas server leen JSON de `cypress/fixtures` vía `readFixture<T>()`. Sin tocar producción.
- **E2E determinista**: sólo interceptamos **búsqueda** en cliente; lo demás llega estable desde SSR mockeado.

### Imágenes sin pixelar
- `next/image` + **loader Marvel**:
  - Detecta si la URL trae o no *variant*; genera la adecuada según `width`.
  - *Portrait* para cómics; *Standard* (cuadrado) para cards.
  - Config de `next.config` con `remotePatterns` para `i.annihil.us` + `images.qualities` (Next 16).
- `sizes` correctos para que el server elija el asset justo.

### Accesibilidad
- Roles semánticos (`role="banner"`, headings correctos).
- `aria-pressed` en toggles de favoritos.
- `aria-label` descriptivas, `title`, gestión de focus y `:focus-visible`.
- Texto alternativo en todas las imágenes.

### Limpieza de DOM en transiciones/overlays
- Al desmontar nodos portaleados (progress/overlays), usamos eliminación **segura** (`el.isConnected && el.remove()`), evitando errores tipo `removeChild on Node`.

---

## 🧩 Scripts útiles (ejemplo)

```jsonc
// package.json (extracto)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",

    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",

    "e2e": "cross-env MOCK_API=1 next dev -p 3000 & wait-on http://localhost:3000 && cypress run",
    "e2e:open": "cross-env MOCK_API=1 next dev -p 3000 & wait-on http://localhost:3000 && cypress open",

    "lint": "eslint . --format pretty",
    "lint:fix": "eslint . --fix --format pretty",
    "format": "prettier --write ."
  }
}
```

> Dependencias usadas en los scripts: `cross-env`, `wait-on`, `cypress`. Si prefieres, puedes sustituir por `concurrently` o `turbo run`.

---

## 📦 Estructura de fixtures (Cypress)

- `characters.json` → listado general.
- `characters.adam-warlock.json` → búsqueda “Adam Warlock” (`{ results: [...] }`).
- `character.adam-warlock.json` → detalle.
- `comics.adam-warlock.json` → cómics (máx. 20).

El **intercept** del E2E sólo afecta a `/api/marvel/characters?nameStartsWith=…`. El SSR lee los ficheros de `cypress/fixtures` cuando `MOCK_API=1`.

---

## 🔧 Linting y configuración TS

- **ESLint** con:
  - Reglas de Next, React Hooks, a11y, Cypress.
  - Typed rules (`parserOptions.project`) separando TS de app y TS de Cypress (`tsconfig.cypress.json`).
- **Cypress lint**: evitamos `unsafe-to-chain-command` dividiendo las cadenas:
  ```ts
  cy.contains('[data-cy=character-card]', 'Adam Warlock').as('adam');
  cy.get('@adam').should('exist');
  cy.get('@adam').scrollIntoView();
  cy.get('@adam').should('be.visible');
  ```

---

## 📚 Qué mejoraría con más tiempo

- Imagen **blur placeholders** derivadas del base Marvel.
- Paginación/infinite scroll real del listado.
- Cacheado de resultados por query.
- CI (GitHub Actions) con jobs de lint, unit y e2e (Vite/Next cache).
- Métricas de Web Vitals y audit Lighthouse automation.

---

## 📝 Licencia

MIT — uso libre con atribución.  
**Atribución Marvel**: © Marvel. Datos e imágenes cortesía de la **Marvel API**. Consulte términos y límites de uso de la API.
