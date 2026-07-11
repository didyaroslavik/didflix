# 🎬 DidFlix

A full-stack movie and TV show tracking application built to replace a personal Excel spreadsheet. Track what you've watched, rate titles, write reviews, and share your collection with friends.

**Live:** https://didflix.vercel.app

---

## Features

- 🔐 JWT authentication with HTTP-only cookies
- 🎬 Real movie search via TMDB API with debounced input
- ⭐ Personal ratings (1.0–10.0), reviews, and watch status
- ✏️ Edit and delete collection entries
- 📊 Statistics dashboard with rating distribution charts
- 🔗 Shareable public profile links
- 👥 User search and public profile browsing
- 🌍 Multilingual UI — English, Ukrainian, Polish
- 📱 Responsive design, mobile-friendly

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, React Router v6, Recharts, i18next, Axios

**Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcryptjs

**APIs:** TMDB (The Movie Database)

**Deployment:** Vercel (frontend) · Railway (backend + database)

---

## Running Locally

**Requirements:** Node.js 18+, PostgreSQL

```bash
# Backend
cd backend
npm install
# create .env with DATABASE_URL, JWT_SECRET, TMDB_ACCESS_TOKEN, FRONTEND_URL
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
# create .env with VITE_API_URL=http://localhost:3001/api
npm run dev
```

---

## Architecture

didflix/
├── frontend/          # React SPA
│   └── src/
│       ├── api/       # Typed API client functions
│       ├── components/# Reusable UI (Layout, modals)
│       ├── context/   # Auth state via React Context
│       ├── i18n/      # EN / UA / PL translations
│       ├── pages/     # Route-level page components
│       └── types/     # Shared TypeScript interfaces
└── backend/           # Express REST API
    └── src/
        ├── controllers/
        ├── middleware/# JWT auth guard
        ├── routes/
        └── services/  # Business logic layer

---

## Key Design Decisions

**Movie vs Entry separation** — Movie data (title, poster, genres) is stored once and shared across all users. An Entry links a user to a movie and holds personal data (rating, review, status). This avoids duplicating movie data for every user who adds the same title.

**JWT in HTTP-only cookies** — Tokens are never accessible to JavaScript, preventing XSS attacks from stealing auth credentials.

**TMDB proxied through backend** — The API key never reaches the browser. The backend acts as a secure proxy, with the added benefit of being able to cache results later.