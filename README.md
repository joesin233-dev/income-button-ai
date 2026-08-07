# Income Button AI

A mobile-first income execution assistant: one button, six questions, a
reality-checked income plan, and an "Action Mode" that turns the top
opportunity into a checklist, ready-to-send templates, and a timeline.

## Project structure (copy exactly this layout)

```
income-button-ai/
├── api/                          ← Vercel serverless functions (server-side only)
│   ├── _lib/
│   │   └── prompts.js            ← shared prompt builders
│   ├── generate-plan.js          ← calls Claude for the initial plan
│   └── generate-action-plan.js   ← calls Claude for the Action Mode kit
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── ChargeRing.jsx
│   │   ├── DifficultyBadge.jsx
│   │   ├── Misc.jsx              ← SectionLabel, StatCard, EmptyNote
│   │   ├── PowerButton.jsx
│   │   ├── TemplateCard.jsx
│   │   └── TopBar.jsx
│   ├── lib/
│   │   ├── api.js                ← client calls to /api/* (never to Anthropic directly)
│   │   ├── futureModules.js      ← documented stubs for what's next (see below)
│   │   └── storage.js            ← localStorage wrapper (swap later for a real DB)
│   ├── App.jsx                   ← all screens + state
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md   (this file)
```

Everything above is already written for you. Just copy the whole
`income-button-ai/` folder as-is into a new empty folder or git repo — there's
nothing to merge or rename.

## 1. Run it locally

```bash
cd income-button-ai
npm install
npm run dev
```

This starts the Vite dev server (usually `http://localhost:5173`) and gets
you the full UI: landing, the power button, the 6-question flow, results,
dashboard, and the payout screen.

**Important:** `npm run dev` alone does **not** run the `/api` serverless
functions — Vite doesn't know about them. So "Find my path" and "Start This
Income Path" will fail locally with plain `npm run dev` (you'll see a fetch
error, not a crash). To test the AI calls locally too, install the Vercel CLI
and run the project the way Vercel actually runs it:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` serves both the Vite frontend and the `/api` functions together,
which is what you want for full local testing.

Either way, first copy the env example and add your real key:

```bash
cp .env.example .env
# then edit .env and paste your real ANTHROPIC_API_KEY
```

## 2. Deploy to Vercel

1. Push this folder to a GitHub repo (or use `vercel` CLI directly from the folder).
2. Go to vercel.com → **Add New Project** → import the repo. Vercel
   auto-detects Vite; no build settings need to change (build command
   `npm run build`, output directory `dist` — already the defaults).
3. Before the first deploy (or right after), go to **Project Settings →
   Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your real Anthropic API key
   
   Set it for all environments (Production, Preview, Development).
4. Deploy. Vercel builds the Vite app *and* automatically turns everything
   in `/api` into serverless functions — no extra config needed.

Your API key never reaches the browser: `src/lib/api.js` only ever calls
your own `/api/generate-plan` and `/api/generate-action-plan` routes, and
those two files (in `/api`) are the only places that hold the key, read from
`process.env.ANTHROPIC_API_KEY` on the server.

## 3. What's real vs. placeholder right now

- **Real:** the full UI, the 6-question flow, both AI calls (via your own
  backend functions), local persistence of your plan/tasks/earnings/action
  plans/reflections (via `localStorage`, wrapped in `src/lib/storage.js`).
- **Placeholder, by design:** the Payout screen (Airtel Money / MTN Money /
  Visa-Card) only *saves a preference* — no payment is processed.
- **Not built yet, but wired for later:** `src/lib/futureModules.js` has
  documented, clearly-not-implemented stub functions for opportunity
  matching against real listings, customer discovery, automated outreach,
  and real payment processing. Nothing calls them yet — they exist so the
  next phase has an obvious place to land instead of getting bolted onto
  whatever file is closest.

## 4. Data storage today vs. later

Right now all user data (answers, plan, tasks, earnings, started paths,
action-plan checklists, reflections) lives in the browser's `localStorage`
via `src/lib/storage.js`. That means it's per-device and disappears if the
user clears site data. When you're ready for real accounts and a database,
you only need to change the inside of `getState()` / `setState()` in that
one file to call your backend instead — nothing in `App.jsx` or the
components needs to change.
