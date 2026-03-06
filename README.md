# CC — Productivity Calculator

A clean, mobile-first productivity calculator built with Next.js, TypeScript, TypeORM, and SQLite.

## Features

- Standard calculator operations: +, −, ×, ÷, %, +/−
- Decimal number support
- Calculation history stored in SQLite
- Keyboard support
- Mobile-first responsive dark UI

## Development

```bash
npm install
npm run dev
```

## Production (Docker)

```bash
docker-compose up --build
```

The app will be available at http://localhost:3000

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./data/cc.sqlite` | Path to SQLite database file |
| `PORT` | `3000` | Port to run the server on |

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/history` | Get last 50 calculations |
| `POST` | `/api/history` | Save a new calculation |
| `DELETE` | `/api/history` | Clear all history |
