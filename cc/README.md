# cc — Productivity Calculator

A clean, mobile-responsive calculator app built with Next.js, TypeScript, and SQLite.

## Features

- Standard arithmetic operations (+, -, ×, ÷)
- Square root, percentage, sign toggle
- Decimal point support
- Chained operations
- Calculation history persisted to SQLite
- Keyboard support
- Dark theme, mobile-first UI

## Getting Started

### Development

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production (Docker)

```bash
docker-compose up --build
```

App will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./data/calculator.db` | Path to SQLite database file |
| `NEXT_PUBLIC_APP_NAME` | `cc` | App name displayed in UI |

## API

### `GET /api/history`
Returns the last 50 calculations.

### `POST /api/history`
Saves a new calculation.

```json
{ "expression": "2 + 3", "result": "5" }
```

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `0–9` | Input digit |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Operators |
| `Enter` or `=` | Calculate |
| `Escape` | Clear |
| `Backspace` | Delete last digit |
| `%` | Percentage |
