# hello, object ！！💎

An interactive browser-based puzzle game for learning Ruby object-oriented programming concepts. Players write real Ruby code in a built-in editor to interact with in-game objects and solve puzzles to progress through the world.

---

## Overview

**hello, object** (displayed in-game as **RUBY SOVEREIGN**) is a learn-by-doing experience. The world is populated with Ruby objects — doors, chests, keys, tomes, mirrors, NPCs, and more. To interact with them, players write Ruby expressions in the **Magic Note** editor. Execution results, object state, and game events are reflected in real time on the UI.

The ultimate goal: open the **Cursed Door** by manipulating objects through code.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Ruby on Rails 7.1 (API mode) |
| Database | SQLite3 |
| Web Server | Puma |
| Deployment | Railway (Docker) |

---

## Project Structure

```
hello--object/
├── frontend/          # React (Vite) SPA
│   └── src/
│       ├── components/  # WorldView, MagicNote, Onboarding, VictoryScreen, etc.
│       ├── hooks/       # useLocalStorage, useKeyboardShortcuts
│       └── utils/       # sounds
├── backend/           # Ruby on Rails application
│   └── app/
│       ├── controllers/ # execution_controller (execute, state, reset)
│       ├── models/      # Game objects (Door, Chest, Key, Tome, Mirror, Npc, ...)
│       └── services/    # RubyEvaluator, WorldManager, Engine
├── Dockerfile         # Multi-stage build (Node → Ruby → production)
└── railway.json       # Railway deployment config
```

---

## Getting Started

### Prerequisites

- Ruby 4.0.0
- Node.js 20+
- Bundler

### Backend

```bash
cd backend
bundle install
bin/rails server
```

### Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies API requests to the Rails backend at `http://localhost:3000`.

---

## How to Play

1. Open the app in your browser.
2. Select an object in the **World View** panel on the left.
3. Write Ruby code in the **Magic Note** editor (e.g., `key.pick_up`, `chest.open(key)`).
4. Press **Execute** (or `Ctrl+Enter`) to run the code.
5. Watch the object's state, event log, and Navi guide update in real time.
6. Solve all puzzles to open the **Cursed Door** and win!

---

## Deployment

The app is deployed on [Railway](https://railway.app) using the provided `Dockerfile`.  
The multi-stage build compiles the React frontend and embeds it into the Rails `public/` folder, so a single container serves everything.

```bash
# Railway picks this up automatically via railway.json
docker build -t hello-object .
docker run -p 3000:3000 hello-object
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/state` | Get current world state (all objects + scenes) |
| `POST` | `/execute` | Execute Ruby code against the world |
| `POST` | `/reset` | Reset the world to its initial state |
| `GET` | `/up` | Health check |
