## Plan: Strength-only routine builder + AI coach webapp

### Product principle

Build the **tracker and analytics engine first**, then the LLM coach. The AI routine generator in Phase 2 will only be useful if Phase 1 captures clean workout history: exercises, sets, reps, weight, supersets, dropsets, duration, skipped body parts, progression, and user preferences.

---

## Recommended zero/minimal-cost stack

| Layer             | Recommendation                                                             | Why                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend          | React + Vite or Next.js, Tailwind, shadcn/ui, TanStack Query               | Fast responsive UI, reusable components, good caching                                                                                                                                                                                                                           |
| Hosting           | Cloudflare Pages/Workers or Vercel                                         | Cloudflare Workers Free includes 100,000 requests/day; Vercel Hobby is also free but restricted to personal/non-commercial use. ([Cloudflare Docs](https://developers.cloudflare.com/workers/platform/limits/))                                                                 |
| Database/Auth     | Supabase Postgres + Supabase Auth + Row Level Security                     | Free tier includes Postgres, auth, 50,000 monthly active users, 500 MB database, 1 GB storage, and 5 GB egress. ([Supabase](https://supabase.com/pricing?utm_source=chatgpt.com))                                                                                               |
| Exercise data     | ExerciseDB/AscendAPI free endpoint imported into your DB                   | Free tier has 1,500 exercises, 180p GIFs, no auth, and fields like exercise ID, name, GIF URL, body parts, target muscles, equipment, and instructions. ([docs.ascendapi.com](https://docs.ascendapi.com/products/edb-v1/overview))                                             |
| RAG/vector search | Supabase pgvector                                                          | Supabase supports pgvector for embeddings and RAG directly inside Postgres, avoiding a paid vector DB. ([Supabase](https://supabase.com/docs/guides/database/extensions/pgvector))                                                                                              |
| LLM phase         | Gemini 2.5 Flash-Lite / Flash, user-provided API key, or local WebLLM mode | Gemini Flash-Lite currently has free-tier text input/output and low paid-tier prices; WebLLM can run inference in-browser with WebGPU and no server support, but it is device-dependent. ([Google AI for Developers](https://ai.google.dev/gemini-api/docs/pricing?authuser=1)) |

For commercial production, verify ExerciseDB licensing before shipping. If you need better taxonomy, substitutions, progressions, regressions, and similarity relationships, EDB Exercise Intelligence is more app-ready but paid/self-hosted. ([ExerciseDB.io](https://exercisedb.io/))

---

# Phase 1: Routine creation, workout logging, and analytics

## 1. Exercise library ingestion

Do **not** call the exercise API live every time the user opens the app. Instead:

1. Create an `exercises` table.
2. Run a one-time import from ExerciseDB.
3. Store:

- `source_exercise_id`
- `name`
- `gif_url`
- `body_parts`
- `target_muscles`
- `secondary_muscles`
- `equipment`
- `instructions`
- `source`
- `is_strength`
- `aliases`

4. Filter to strength movements using available metadata, equipment, target muscles, and a manual allow/block list.
5. Lazy-load GIFs only when an exercise row is expanded.

For long-term quality, add a small admin screen where you can correct exercise names, mark non-strength movements as hidden, add aliases like “DB bench press” → “dumbbell bench press,” and tag compound/isolation movements.

---

## 2. Routine builder

Core screens:

### Routine list

Users can create routines such as:

- Push Pull Legs
- Upper Lower
- Full Body
- Chest/Back/Legs split
- Custom strength block

### Routine editor

Each routine should support:

- Routine name
- Training days
- Exercise search by muscle, body part, equipment, and name
- Drag-and-drop exercise ordering
- Target sets, reps, rest time, and notes
- Superset grouping
- Optional default progression notes
- Exercise GIF preview on expand
- Duplicate routine
- Archive routine

### Exercise picker UX

Each exercise card should show:

- Name
- Primary muscle
- Secondary muscles
- Equipment
- Small thumbnail/GIF preview
- Expandable full GIF and instructions
- “Add to routine” button

Keep the picker fast by indexing exercises locally, caching results, and not loading GIFs until expansion.

---

## 3. Active workout session

When the user taps **Start Routine**, create a `workout_session`.

Session features:

- Start, pause, resume, stop
- Live elapsed duration
- Per-exercise logging
- Previous performance shown inline
- Quick-add set
- Copy previous set
- Mark set as warm-up, working, dropset, failure, or skipped
- Superset navigation
- Rest timer
- Notes per exercise and per session

Workout duration should be calculated as:

```text
duration = stop_time - start_time - total_paused_time
```

Store both raw timestamps and computed duration so analytics remain reliable.

---

## 4. Logging model for sets, dropsets, and supersets

Use a flexible structure instead of hardcoding every set type.

### Key entities

| Table                  | Purpose                               |
| ---------------------- | ------------------------------------- |
| `routines`             | Saved user routines                   |
| `routine_days`         | Day-level structure inside routine    |
| `routine_exercises`    | Exercises assigned to a routine day   |
| `routine_set_targets`  | Planned sets/reps/rest/intensity      |
| `workout_sessions`     | Each started workout                  |
| `workout_exercises`    | Exercise instance inside a workout    |
| `performed_sets`       | Actual logged sets                    |
| `exercise_groups`      | Supersets, circuits, paired exercises |
| `body_measurements`    | Weight, measurements, weak areas      |
| `exercise_preferences` | Liked/disliked/preferred exercises    |
| `analytics_snapshots`  | Cached metrics for fast dashboards    |

### `performed_sets` should support:

- `exercise_id`
- `workout_session_id`
- `set_number`
- `weight`
- `reps`
- `rpe`
- `is_warmup`
- `is_failure`
- `set_type`: normal, warmup, drop, backoff
- `parent_set_id`: for dropsets
- `drop_index`: first drop, second drop, etc.
- `superset_group_id`
- `notes`

For supersets, group two or more `workout_exercises` under the same `exercise_group` with `group_type = superset`.

For dropsets, connect the lighter follow-up sets to the main set using `parent_set_id`.

---

## 5. Analytics page

The analytics page should feel like a coach reviewing the user’s training log.

### Core metrics

1. **Estimated 1RM**

- Use one formula consistently, such as Epley:
- Show new estimated 1RM PRs per exercise.

2. **Volume**

```text
 set_volume = weight * reps
 exercise_volume = sum(weight * reps)
 session_volume = sum(all exercise volume)
```

3. **Progressive loading**
   Track:

- More weight at same reps
- More reps at same weight
- More total volume
- Better estimated 1RM
- Reduced rest time at same performance

4. **Body-part coverage**
   Use exercise metadata to calculate weekly sets per muscle group:

- Chest
- Back
- Quads
- Hamstrings/glutes
- Shoulders
- Biceps
- Triceps
- Calves
- Core

5. **Skipped body parts**
   Compare planned vs completed body-part exposure for the week.
6. **Exercise consistency**
   Track whether the user is switching exercises too often.
7. **Weak areas**
   Weak areas can be inferred from:

- User-selected weak body parts
- Stalled progress
- Low weekly volume
- Poor adherence
- Measurements changing slower than other areas

### Dashboard sections

- This week’s training summary
- PRs achieved
- Volume trend
- Estimated 1RM trend
- Body-part heatmap
- Missed/skipped muscle groups
- Best-performing exercises
- Exercises that have stalled
- Suggested focus for next week

---

## 6. Responsive UI design

Use a mobile-first layout because most users will log workouts in the gym.

### Pages

1. **Dashboard**

- Current routine
- Start workout button
- Weekly progress
- Missed body parts
- Recent PRs

2. **Routines**

- Saved routines
- Create routine
- Duplicate/archive routine

3. **Routine Builder**

- Exercise picker
- Drag-and-drop ordering
- Superset grouping
- Planned sets/reps

4. **Active Workout**

- Big touch targets
- Minimal typing
- Previous set shortcuts
- Rest timer
- Sticky bottom action bar

5. **Exercise Library**

- Search/filter
- GIF demo
- Instructions

6. **Analytics**

- Volume
- 1RM
- body-part coverage
- progression trends

7. **AI Coach — Phase 2**

- Generate new plan
- Explain current weaknesses
- Ask for routine changes

---

## Phase 1 acceptance criteria

Phase 1 is successful when a user can:

- Create a routine from a known exercise list
- Expand an exercise and see the GIF/instructions
- Start and stop a workout
- See workout duration
- Log sets, reps, weight, dropsets, and supersets
- Save complete workout history
- View analytics for volume, estimated 1RM, progress, and skipped body parts
- Use the app smoothly on mobile in a gym setting

---

# Phase 2: LLM-generated custom strength routines

## 1. Do not let the LLM work from raw logs

The LLM should not receive thousands of set records. Instead, create compact summaries first.

Generate a `user_training_profile` object like:

```json
{
  "goal": "strength and hypertrophy",
  "available_days_per_week": 4,
  "session_duration_preference_minutes": 60,
  "equipment": ["barbell", "dumbbells", "cables", "machines"],
  "preferred_exercises_by_body_part": {
    "chest": ["barbell bench press", "incline dumbbell press"],
    "back": ["lat pulldown", "barbell row"]
  },
  "weak_areas": ["upper chest", "rear delts"],
  "skipped_body_parts_this_week": ["hamstrings"],
  "recent_stalled_exercises": ["barbell bench press"],
  "recent_prs": ["deadlift"],
  "injury_or_pain_notes": [],
  "training_age": "intermediate"
}
```

This keeps latency and token cost low.

---

## 2. RAG knowledge base

Use RAG only for stable strength-training knowledge and your app’s own exercise metadata.

Store chunks for:

- Exercise selection rules
- Progressive overload rules
- Weekly volume guidelines
- Deload logic
- Superset compatibility
- Strength-focused rep ranges
- Exercise substitution logic
- Movement pattern balance
- Equipment constraints
- User preference summaries
- Exercise metadata

Supabase pgvector is enough for this; no separate vector database is needed. ([Supabase](https://supabase.com/docs/guides/database/extensions/pgvector))

---

## 3. LLM agent workflow

When the user asks for a new routine:

1. Fetch user profile.
2. Fetch last 4–12 weeks of summarized training.
3. Fetch preferred exercises by body part.
4. Fetch weak/skipped body parts.
5. Retrieve relevant strength-training rules from RAG.
6. Retrieve candidate exercises from the local exercise DB.
7. Ask the LLM to generate a structured routine JSON.
8. Run deterministic validation.
9. Show the user the plan with explanation.
10. Let the user accept, edit, or regenerate.

The LLM should output structured JSON, not freeform text.

Example output shape:

```json
{
  "routine_name": "4-Day Upper Lower Strength Block",
  "recommended_duration_weeks": 6,
  "reasoning_summary": "Focuses on upper chest, hamstrings, and maintaining bench/deadlift progression.",
  "days": [
    {
      "day_name": "Upper A",
      "exercises": [
        {
          "exercise_id": "barbell_bench_press",
          "sets": 4,
          "reps": "4-6",
          "rest_seconds": 180,
          "progression_rule": "Add 2.5 kg when all sets hit 6 reps."
        }
      ]
    }
  ]
}
```

---

## 4. Deterministic validation layer

Do not trust the LLM blindly. After generation, validate:

- All exercises exist in the local exercise DB
- All exercises match available equipment
- No accidental cardio-only or mobility-only exercises
- Weekly muscle volume is within configured limits
- Weak areas are addressed
- Skipped body parts are not ignored
- Supersets do not pair two highly fatiguing compound lifts badly
- The plan fits the user’s available days
- The plan includes a recommended block duration
- Exercises are not changed too frequently

If validation fails, either auto-repair the plan or ask the LLM to regenerate with the validation errors.

---

## 5. Coach logic for routine duration

The app should discourage routine-hopping.

Default recommendation:

- Beginner: follow a plan for 6–8 weeks
- Intermediate: follow a plan for 4–8 weeks
- Advanced: follow a block for 3–6 weeks depending on fatigue and specificity

The LLM should explain:

- Why this duration was chosen
- Which exercises should remain stable
- Which accessories can rotate
- When to deload
- When to test or estimate new 1RM

A good default is: **keep main compound lifts stable for the full block, allow minor accessory substitutions only when recovery, equipment, pain, or adherence requires it.**

---

## 6. LLM cost-control strategy

To keep costs minimal:

- Do not call the LLM during normal workout logging.
- Only call it when the user asks for a new routine or explanation.
- Cache generated routines.
- Summarize user history before sending it to the model.
- Use small/cheap models first.
- Use a user-provided API key option.
- Add per-user monthly generation limits.
- Use Gemini Flash-Lite/Flash for low-cost generation; Google’s current pricing page lists free-tier text input/output for Gemini 2.5 Flash and Flash-Lite, with low paid-tier token prices. ([Google AI for Developers](https://ai.google.dev/gemini-api/docs/pricing?authuser=1))
- Check active quotas in Google AI Studio because Gemini rate limits vary by model, project, and tier. ([Google AI for Developers](https://ai.google.dev/gemini-api/docs/rate-limits?hl=en&utm_source=chatgpt.com))

For a true zero-inference-cost experiment, add an optional local mode using WebLLM, but treat it as advanced because browser model download time, device compatibility, and WebGPU support will vary. ([GitHub](https://github.com/mlc-ai/web-llm?utm_source=chatgpt.com))

---

# Build milestones

## Milestone 1: Foundation

- Set up frontend
- Set up Supabase
- Add auth
- Create database schema
- Import exercises
- Build exercise library page
- Add GIF expansion

## Milestone 2: Routine builder

- Create routine CRUD
- Add exercise picker
- Add planned sets/reps/rest
- Add drag-and-drop ordering
- Add superset grouping
- Add routine duplication

## Milestone 3: Active workout logging

- Start/pause/stop session
- Live duration timer
- Log sets/reps/weight
- Add dropsets
- Add supersets
- Add previous-set shortcuts
- Save workout history

## Milestone 4: Analytics

- Volume trends
- Estimated 1RM trends
- PR detection
- Body-part heatmap
- Skipped body-part detection
- Progressive overload insights

## Milestone 5: Phase 2 AI coach

- Build user training profile summary
- Add body measurements and weak-area tracking
- Add pgvector/RAG tables
- Add LLM prompt + JSON schema
- Add validation layer
- Add generated routine preview
- Add accept/edit/regenerate flow

---

## MVP scope I would ship first

The leanest useful version:

1. Exercise library with GIFs.
2. Routine builder.
3. Active workout logger.
4. Set history.
5. Estimated 1RM and volume analytics.
6. Body-part coverage.
7. Basic “suggest next routine” button using rules, not an LLM.
8. Add LLM generation only after the logs are reliable.

This keeps Phase 1 nearly free, fast, and useful even before AI. Then Phase 2 becomes a real coach because it has clean data to reason over.

Work on phase 1
