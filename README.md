# Nona Config Admin

[![CI](https://github.com/Ryware/nona-config-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/Ryware/nona-config-admin/actions/workflows/ci.yml)

Admin panel for Nona Config management system.

## Setup

```bash
npm install
npm run dev
```

## Configuration

Development uses same-origin API URLs and proxies backend routes through Vite:

```env
VITE_API_BASE_URL=
VITE_PROXY_TARGET=http://localhost:5027
```

Leave `VITE_API_BASE_URL` empty when the admin UI is served by the same host as
the API. Set it only when the frontend and API are deployed on different
origins.

## Tech Stack

- SolidJS + TypeScript
- Vite
- Tailwind CSS
- TanStack Query
