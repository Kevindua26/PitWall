# F1 Nexus — Formula 1 Web Platform

## Overview

A full-featured, visually stunning F1 portal built with **PHP 8+** as the backend engine. The site fetches live data from public F1 APIs, caches it in SQLite, and serves a rich React+Vite frontend with Three.js scroll animations. All API calls are proxied through PHP so the frontend never touches external services directly.

---

## Tech Stack (Final)

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | **PHP 8.2** (vanilla, no framework) | Mandatory; handles routing, API proxy, caching |
| Data APIs | **Jolpica-F1** (Ergast-compat) + **OpenF1** | Free, no key needed, real 2025 data |
| Database | **SQLite** (via PDO) | Zero-config, file-based, perfect for caching |
| Frontend | **React 18 + Vite** | Component-based, fast HMR, plays well with PHP |
| 3D / Animation | **Three.js + GSAP ScrollTrigger** | Industry standard for scroll-driven 3D |
| Styling | **Tailwind CSS v3** | User requested |
| Dev Server | **PHP built-in server** (backend) + **Vite** (frontend) | Simple local dev |

> **Note:** FastAPI was dropped — it adds a Python dependency with no benefit when PHP already handles routing and proxying. PHP is the only backend language needed.

---

## Color Palette

| Token | Color | Use |
|-------|-------|-----|
| `--f1-red` | `#E8002D` | Primary accent (F1 official red) |
| `--f1-dark` | `#0A0A0F` | Background |
| `--f1-carbon` | `#141418` | Card surfaces |
| `--f1-silver` | `#C0C0C8` | Secondary text |
| `--f1-gold` | `#FFD700` | Winners / P1 highlight |
| `--f1-white` | `#F5F5F5` | Primary text |

---

## Architecture

```
d:\Work\Clg\Php\
├── public/                  ← PHP entry & static assets (web root)
│   ├── index.php            ← Front controller (routes all requests)
│   ├── api/                 ← PHP REST API endpoints
│   │   ├── races.php
│   │   ├── drivers.php
│   │   ├── constructors.php
│   │   ├── garage.php
│   │   └── prediction.php
│   └── dist/                ← Built React app (Vite output)
├── src/                     ← React + Vite source
│   ├── main.jsx
│   ├── App.jsx
│   ├── pages/
│   │   ├── Home.jsx         ← 3D hero + scroll sections
│   │   ├── Races.jsx
│   │   ├── Drivers.jsx
│   │   ├── Constructors.jsx
│   │   ├── Garage.jsx
│   │   └── Prediction.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── F1CarScene.jsx   ← Three.js canvas
│   │   ├── RaceCard.jsx
│   │   ├── DriverCard.jsx
│   │   └── ...
│   └── index.css
├── php/                     ← PHP classes & helpers
│   ├── Database.php         ← SQLite PDO wrapper + cache
│   ├── F1ApiClient.php      ← Jolpica + OpenF1 HTTP client
│   └── Router.php           ← Simple path router
├── database/
│   └── f1_cache.db          ← SQLite file (auto-created)
├── package.json             ← Vite + React deps
├── tailwind.config.js
├── vite.config.js
└── composer.json            ← (optional) if Guzzle is needed
```

---

## Pages & Features

### 1. Home (`/`)
- **Hero**: Full-screen Three.js canvas — procedural F1 car mesh with GSAP ScrollTrigger driving camera orbit + car reveal
- **Scroll Sections**: Race Calendar preview → Driver Standings → Constructor Standings → CTA cards for all pages
- Parallax star-field background with red speed-lines

### 2. Races (`/races`)
- Current season schedule (Jolpica API)
- Current race: lap-by-lap leader, fastest lap, weather strip
- Upcoming race: circuit map SVG, countdown timer, session schedule
- Past results accordion

### 3. Prediction System (`/prediction`)
- SQLite-backed prediction model: weighted score from qualifying position + historical circuit performance
- Users can submit their own prediction and see where they rank vs the model
- Confidence bar + podium prediction card

### 4. Garage (`/garage`)
- Year-picker (2015–2025) — fetches constructor + car tech data
- Car spec cards: engine, aero package, tire strategy
- Side-by-side performance radar chart (Chart.js)

### 5. Drivers (`/drivers`)
- All 2025 drivers: photo, nationality flag, team color, points, wins
- Expandable detail panel: career stats, circuit-by-circuit heatmap

### 6. Constructor Strategies (`/constructors`)
- Pit-stop strategy breakdown per constructor
- Tire compound preferences, average pit delta
- Championship trajectory line chart

---

## PHP API Endpoints (public/api/)

| File | Route | Returns |
|------|-------|---------|
| `races.php` | `GET /api/races?season=2025` | Race schedule + results |
| `races.php` | `GET /api/races/current` | Current/next race detail |
| `drivers.php` | `GET /api/drivers?season=2025` | Driver list + standings |
| `constructors.php` | `GET /api/constructors?season=2025` | Constructor list + standings |
| `garage.php` | `GET /api/garage?year=2025` | Car specs per constructor |
| `prediction.php` | `GET /api/prediction?race=X` | Model prediction |
| `prediction.php` | `POST /api/prediction` | Submit user prediction |

All endpoints cache responses in SQLite for **1 hour** (race data) or **24 hours** (static data like drivers/constructors).

---

## Open Questions

> [!IMPORTANT]
> **Do you have PHP installed locally?** The site runs on the PHP built-in server (`php -S localhost:8000`). If not, we can alternatively use XAMPP/Laragon/Wamp. Please confirm your setup.

> [!IMPORTANT]
> **Do you have Node.js installed?** Vite + React requires Node ≥18. Run `node -v` to check. If you'd prefer a purely HTML/JS frontend (no build step), I can make that work too — just say so.

> [!NOTE]
> **Prediction model depth**: The current plan uses a statistical weighted model (qualifying + historical data). Should it also allow users to create accounts and save predictions? Or keep it session-based (no login)?

> [!NOTE]
> **Garage data source**: The Jolpica API has constructor data but limited car tech specs. For garage car specs (aero, engine mode, etc.), I'll supplement with curated static data stored in SQLite. This gives richer content but means specs are manually authored. OK with you?

---

## Verification Plan

### Automated
- PHP endpoints tested via `curl` / browser fetch
- SQLite cache verified with `sqlite3` CLI
- Vite build: `npm run build` must complete without errors

### Manual
- Visit each page, confirm data loads from API
- Scroll through hero — Three.js animation must trigger
- Prediction form submit → response appears
- Test on Chrome + Firefox

