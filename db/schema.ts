import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  sourceExerciseId: text("source_exercise_id").notNull(),
  name: text("name").notNull(),
  gifUrl: text("gif_url").notNull(),
  bodyParts: text("body_parts", { mode: "json" }).$type<string[]>().notNull(),
  targetMuscles: text("target_muscles", { mode: "json" }).$type<string[]>().notNull(),
  secondaryMuscles: text("secondary_muscles", { mode: "json" }).$type<string[]>().notNull(),
  equipment: text("equipment", { mode: "json" }).$type<string[]>().notNull(),
  instructions: text("instructions", { mode: "json" }).$type<string[]>().notNull(),
  source: text("source").notNull(),
  isStrength: integer("is_strength", { mode: "boolean" }).notNull(),
  aliases: text("aliases", { mode: "json" }).$type<string[]>().notNull(),
  movementType: text("movement_type").notNull(),
  hidden: integer("hidden", { mode: "boolean" }).default(false).notNull(),
});

export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  trainingDays: integer("training_days").notNull(),
  archived: integer("archived", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const routineDays = sqliteTable("routine_days", {
  id: text("id").primaryKey(),
  routineId: text("routine_id").notNull(),
  name: text("name").notNull(),
  dayOrder: integer("day_order").notNull(),
});

export const exerciseGroups = sqliteTable("exercise_groups", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  routineDayId: text("routine_day_id"),
  workoutSessionId: text("workout_session_id"),
  groupType: text("group_type").notNull(),
  label: text("label").notNull(),
});

export const routineExercises = sqliteTable("routine_exercises", {
  id: text("id").primaryKey(),
  routineDayId: text("routine_day_id").notNull(),
  exerciseId: text("exercise_id").notNull(),
  exerciseOrder: integer("exercise_order").notNull(),
  notes: text("notes").notNull().default(""),
  progressionNotes: text("progression_notes").notNull().default(""),
  supersetGroupId: text("superset_group_id"),
});

export const routineSetTargets = sqliteTable("routine_set_targets", {
  id: text("id").primaryKey(),
  routineExerciseId: text("routine_exercise_id").notNull(),
  setNumber: integer("set_number").notNull(),
  targetReps: text("target_reps").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  intensity: text("intensity").notNull().default(""),
});

export const workoutSessions = sqliteTable("workout_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  routineId: text("routine_id").notNull(),
  routineDayId: text("routine_day_id").notNull(),
  startedAt: text("started_at").notNull(),
  stoppedAt: text("stopped_at"),
  pausedAt: text("paused_at"),
  totalPausedSeconds: integer("total_paused_seconds").notNull().default(0),
  computedDurationSeconds: integer("computed_duration_seconds").notNull().default(0),
  status: text("status").notNull(),
  notes: text("notes").notNull().default(""),
});

export const workoutExercises = sqliteTable("workout_exercises", {
  id: text("id").primaryKey(),
  workoutSessionId: text("workout_session_id").notNull(),
  routineExerciseId: text("routine_exercise_id"),
  exerciseId: text("exercise_id").notNull(),
  exerciseOrder: integer("exercise_order").notNull(),
  notes: text("notes").notNull().default(""),
  supersetGroupId: text("superset_group_id"),
});

export const performedSets = sqliteTable("performed_sets", {
  id: text("id").primaryKey(),
  workoutExerciseId: text("workout_exercise_id").notNull(),
  exerciseId: text("exercise_id").notNull(),
  workoutSessionId: text("workout_session_id").notNull(),
  setNumber: integer("set_number").notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  rpe: real("rpe"),
  isWarmup: integer("is_warmup", { mode: "boolean" }).notNull().default(false),
  isFailure: integer("is_failure", { mode: "boolean" }).notNull().default(false),
  setType: text("set_type").notNull(),
  parentSetId: text("parent_set_id"),
  dropIndex: integer("drop_index"),
  supersetGroupId: text("superset_group_id"),
  notes: text("notes").notNull().default(""),
  completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bodyMeasurements = sqliteTable("body_measurements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  measuredAt: text("measured_at").notNull(),
  bodyWeight: real("body_weight"),
  weakAreas: text("weak_areas", { mode: "json" }).$type<string[]>().notNull(),
  notes: text("notes").notNull().default(""),
});

export const exercisePreferences = sqliteTable("exercise_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  exerciseId: text("exercise_id").notNull(),
  preference: text("preference").notNull(),
  notes: text("notes").notNull().default(""),
});

export const analyticsSnapshots = sqliteTable("analytics_snapshots", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  snapshotAt: text("snapshot_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  metrics: text("metrics", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
});
