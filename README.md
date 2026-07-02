# Strength Tracker Phase 1

Mobile-first routine builder, active workout logger, exercise library, and
analytics engine for strength training. Phase 1 intentionally avoids LLM calls:
it focuses on clean workout history so a future AI coach can reason from
reliable summaries instead of raw logs.

## What is included

- Curated strength exercise seed data with aliases, body parts, equipment,
  instructions, and lazy-loaded GIF previews.
- Routine CRUD basics with training days, planned sets/reps/rest, drag ordering,
  duplication, archive, and superset grouping.
- Active workout logging with pause/resume/stop, duration excluding paused time,
  previous-set shortcuts, warmups, dropsets, backoff sets, failure sets, skipped
  sets, and rest timer.
- Deterministic analytics for volume, Epley estimated 1RM, PRs, body-part
  coverage, skipped body parts, stalled exercises, and weekly focus.
- Supabase-ready TypeScript entities and table-shaped schema, with local
  browser storage as the development fallback.
- ExerciseDB importer boundary in `scripts/import-exercisedb.ts`; the app never
  calls the exercise API on page load.

## Development

```bash
npm ci
npm run dev
npm run build
```

The app runs without Supabase credentials. Local development stores tracker data
in browser storage behind `lib/storage/trackerRepository.ts` so the UI can later
swap to a Supabase implementation without changing screens.

## Data model

Core domain types live in `lib/domain/types.ts`. The hosted schema shape lives in
`db/schema.ts` and includes:

- `exercises`
- `routines`
- `routine_days`
- `routine_exercises`
- `routine_set_targets`
- `exercise_groups`
- `workout_sessions`
- `workout_exercises`
- `performed_sets`
- `body_measurements`
- `exercise_preferences`
- `analytics_snapshots`

## Exercise import path

Set `EXERCISEDB_ENDPOINT` to a compatible ExerciseDB/AscendAPI endpoint and run
the importer with a TypeScript runner. Without an endpoint, it writes the
curated seed preview to `work/exercisedb-import-preview.json`.

The importer is deliberately separate from the UI so exercise data can be
reviewed, filtered, and corrected before becoming app data.
