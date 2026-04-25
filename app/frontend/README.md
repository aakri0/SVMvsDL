# SVMvsDL Dashboard (Frontend)

React + TypeScript + Vite dashboard for the [SVMvsDL](../../README.md) human activity recognition project. It subscribes to predictions from Firestore in real time and visualizes the live activity, accuracy, and historical breakdown.

## Stack

- **React 18** + **TypeScript**
- **Vite 5** (`@vitejs/plugin-react-swc`)
- **TailwindCSS** + **shadcn/ui** (Radix primitives)
- **Recharts** for visualizations
- **Firebase Web SDK** (`firestore`) for live prediction data
- **TanStack Query**, **react-hook-form**, **zod**

## Quick start

```bash
npm install
cp .env.example .env       # then fill in your Firebase web config
npm run dev                # http://localhost:8080
```

## Scripts

| Command            | Description                            |
|--------------------|----------------------------------------|
| `npm run dev`      | Start Vite dev server with HMR         |
| `npm run build`    | Production build to `dist/`            |
| `npm run build:dev`| Development-mode build                 |
| `npm run preview`  | Preview the production build locally   |
| `npm run lint`     | Run ESLint over the project            |

## Configuration

The Firebase web config is read from environment variables prefixed with `VITE_FIREBASE_*`. See `.env.example` for the required keys. Never commit a real `.env` file.

## Project layout

```
src/
├── App.tsx              # Root component / dashboard shell
├── firebase.ts          # Firebase client initialization
├── components/          # Reusable UI + dashboard panels
├── pages/               # Route-level pages (e.g. NotFound)
├── hooks/               # Custom React hooks
└── lib/                 # Utilities
```

For backend setup, the inference API, and the ESP32 firmware, see the [root README](../../README.md).
