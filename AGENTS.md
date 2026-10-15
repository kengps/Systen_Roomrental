# AGENTS.md

## Build & Verify

### Client (Vite + React)
Located in `client/` directory.

```sh
cd client
npx vite build       # Build (use for verification - ESLint config is broken, see below)
npm run dev          # Start dev server
npm run lint         # ESLint (BROKEN - see note below)
```

**Note on ESLint:** The ESLint config in `client/eslint.config.js` has invalid `no-unused-vars` options (line 18). This is a pre-existing issue. Use `npx vite build` for verification instead of lint.

### Backend
Located in `server/` directory (if applicable).

## Code Style Notes
- Project uses Vite + React 18 + Ant Design v5 + Tailwind + SCSS
- Color palette: purple gradient accents (`#9155FD` → `#D333FF`)
- Dark theme sidebar: `#1A1B24` → `#242635`
- User data flows via `persistMiddleware()` zustand store → `user.userPayLoad.user.{username, role, id}`
