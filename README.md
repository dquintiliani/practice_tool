# PM Scenario Simulator

A branching decision-tree simulator for new Data PMs. Trainees work through
pre-authored stakeholder scenarios, get scored against a fixed rubric, and
build a visible completion record. Managers get a read-only dashboard across
all trainees.

Built per the V1 design spec: deterministic, data-driven scenarios (no LLM
judge), multiple choice only, mock auth.

## Stack

- **Client**: React 18 + Vite, client-side routing via `react-router-dom`.
- **Server**: Express (ESM). Scenarios are static JSON data files; attempts
  are persisted to a JSON file (`server/data/attempts.json`) — no external DB
  needed to run this. Swapping in a real database only touches `server/src/store.js`.
- **Auth**: stubbed. The client has an account switcher backed by
  `server/data/users.json` (2 trainees + 1 manager); the selected user id is
  sent as an `x-user-id` header on every API call. No passwords, no sessions.

## Deployment

This app runs as a normal long-lived Node process (Express `app.listen`,
attempts persisted to a local JSON file) — it's intentionally **not**
deployed to Vercel or any other serverless platform right now. Vercel's
model is stateless functions with an ephemeral filesystem, which doesn't fit
`server/src/store.js`'s local-file persistence or a process that needs to
stay running. `vercel.json`'s `ignoreCommand` tells this repo's linked
Vercel project to skip every deploy for now, so CI shows "skipped" rather
than a spurious failure. Run it locally instead (see below).

## Running it

```
npm install
npm run dev
```

This starts the API on `http://localhost:3001` and the Vite dev server (with
`/api` proxied to it) on `http://localhost:5173`.

For a single-process production-style run:

```
npm install
npm run build   # builds client/dist
npm start       # Express serves the API and the built client on :3001
```

## Adding a new scenario

Drop a new JSON file into `server/data/scenarios/` following the shape of
`ambiguous_stakeholder_ask.json` (persona, `nodes` keyed by node id, each node
an array of `options` with `option_text`, `reaction_text`, `next_node`
(`null` = terminal), and a `rubric_signal` map). No code changes are needed —
the engine discovers scenario files at startup.

The four rubric dimensions are fixed across all scenarios (see
`client/src/pages/Debrief.jsx` `DIM_LABELS`); each scenario's
`rubric_dimensions` array picks the relevant subset, and `pass_threshold.count`
sets how many of those must be satisfied to pass.

## Scope note

Per the design spec, only **"The Ambiguous Ask"** is fully authored with a
real branching tree. The other four scenarios (Roadmap Tug-of-War, Metric
That Moved for the Wrong Reason, Build vs. Reuse, Downstream Break) are
single-node placeholder stubs — enough to prove the engine and manager
dashboard work across multiple scenarios end-to-end, not enough to be used
for real training yet. Flagging this back per the spec's instruction in case
full content for all five was expected.

## Acceptance criteria status

- [x] Trainee can list scenarios and see status per scenario
- [x] Trainee can complete a full scenario (start → branching choices → debrief)
- [x] Debrief correctly aggregates `rubric_signal` values into pass/fail per dimension and overall
- [x] Attempts are logged; retries don't overwrite history
- [x] Manager dashboard shows all trainees × scenarios × latest status/score
- [x] Adding a new scenario requires only a new data file, no engine code change
