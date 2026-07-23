# Strength Tracker Phase 1

Mobile-first routine builder, active workout logger, exercise library, and
analytics engine for strength training. Phase 1 intentionally avoids LLM calls:
it focuses on clean workout history so a future AI coach can reason from
reliable summaries instead of raw logs.

## What is included

- ExerciseDB OSS exercise library data with aliases, body parts, equipment,
  instructions, lazy-loaded GIF previews, and a curated local fallback.
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

Run the importer to refresh the cached ExerciseDB OSS library:

```bash
npm exec tsx scripts/import-exercisedb.ts
```

The importer pages through `https://oss.exercisedb.dev/api/v1/exercises` with
`limit=25`, normalizes the ExerciseDB response into the app's `Exercise` shape,
and writes both `lib/data/exercisedb.generated.json` and
`work/exercisedb-import-preview.json`. You can override the source with
`EXERCISEDB_ENDPOINT` for a compatible endpoint.

The importer is deliberately separate from the UI so exercise data can be
reviewed, filtered, and corrected before becoming app data. The OSS data is
allowed for personal projects, prototypes, educational tools, non-commercial
apps, and community fitness projects. Commercial or monetized use requires a
paid plan through AscendAPI/RapidAPI, and AscendAPI attribution is required.
