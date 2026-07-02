CREATE TABLE `analytics_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`snapshot_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`metrics` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `body_measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`measured_at` text NOT NULL,
	`body_weight` real,
	`weak_areas` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`routine_day_id` text,
	`workout_session_id` text,
	`group_type` text NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`preference` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`source_exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`gif_url` text NOT NULL,
	`body_parts` text NOT NULL,
	`target_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`equipment` text NOT NULL,
	`instructions` text NOT NULL,
	`source` text NOT NULL,
	`is_strength` integer NOT NULL,
	`aliases` text NOT NULL,
	`movement_type` text NOT NULL,
	`hidden` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `performed_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_exercise_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`workout_session_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real,
	`is_warmup` integer DEFAULT false NOT NULL,
	`is_failure` integer DEFAULT false NOT NULL,
	`set_type` text NOT NULL,
	`parent_set_id` text,
	`drop_index` integer,
	`superset_group_id` text,
	`notes` text DEFAULT '' NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_days` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`name` text NOT NULL,
	`day_order` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`exercise_order` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`progression_notes` text DEFAULT '' NOT NULL,
	`superset_group_id` text
);
--> statement-breakpoint
CREATE TABLE `routine_set_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`target_reps` text NOT NULL,
	`rest_seconds` integer NOT NULL,
	`intensity` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routines` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`training_days` integer NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_id` text NOT NULL,
	`routine_exercise_id` text,
	`exercise_id` text NOT NULL,
	`exercise_order` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`superset_group_id` text
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`routine_id` text NOT NULL,
	`routine_day_id` text NOT NULL,
	`started_at` text NOT NULL,
	`stopped_at` text,
	`paused_at` text,
	`total_paused_seconds` integer DEFAULT 0 NOT NULL,
	`computed_duration_seconds` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
