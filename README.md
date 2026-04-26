# Cinematic Picks (MovieFlix)

A full-stack movie discovery app with a React + Vite frontend and a Node.js + MongoDB backend.

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui
- Backend: Node.js (Express), MongoDB (Mongoose), JWT auth
- Data source: TMDB API

## Features

- User sign up / sign in with JWT
- Persisted user profile in MongoDB
- Persisted watch history in MongoDB
- Persisted favorites in MongoDB
- Account settings page (name, language, autoplay trailers)
- Movie browsing, search, details, cast, recommendations

## Environment variables

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

## Run locally

```bash
npm install
npm run dev
```

The command starts:

- frontend on Vite default port (usually 5173)
- backend API on `http://localhost:4000`

## API quick check

```bash
curl http://localhost:4000/api/health
```
