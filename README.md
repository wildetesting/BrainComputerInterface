# Flipper Activity Dashboard

A web dashboard for tracking Flipper Zero projects: protocols, pairing steps, target devices, and outcomes.

## Features

- Activity list with status and category badges
- Step-by-step checklists with done / failed / skipped states
- Target device metadata (brand, frequency, protocol, Flipper protocol)
- Pre-seeded activities:
  - **#1** Dominator garage door via ATA PTX4
  - **#2** Windows local user via BadUSB Rubber Ducky script

## Stack

- Next.js 15 (App Router)
- SQLite via better-sqlite3
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database is created automatically at `data/flipper.db` on first run. Activity #1 is seeded when the database is empty.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:seed` | Re-run Dominator seed (only if DB is empty via app init) |

## Activity #1 workflow

The seeded Dominator activity walks through:

1. Firmware update and backup
2. Remote/motor identification
3. Frequency confirmation
4. Add Manually → ATA PTX4
5. Motor learn-mode pairing (double-press handshake)
6. Test and backup `.sub` file

Rolling-code remotes cannot be cloned via Read/Replay — pairing a new virtual remote is the supported path.

## Activity #2 workflow

**Windows local user — BadUSB** (`scripts/win_local_user.txt`):

1. Customize username/password in the Ducky script
2. Copy to Flipper `badusb/` folder via qFlipper
3. Run from Bad USB app on an **authorized** Windows machine with an admin-capable session
4. Verify with `lusrmgr.msc`, then delete the test account when done

Default lab credentials in the script: `flipper_user` / `FlipperTemp123!` — change before use.
