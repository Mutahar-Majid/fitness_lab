export type BodyPart =
  | "chest"
  | "back"
  | "quads"
  | "hamstrings_glutes"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "calves"
  | "core";

export type SetType = "normal" | "warmup" | "drop" | "backoff" | "skipped";
export type SessionStatus = "active" | "paused" | "completed";
export type GroupType = "superset" | "circuit";

export interface Exercise {
  id: string;
  sourceExerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: BodyPart[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  instructions: string[];
  source: string;
  isStrength: boolean;
  aliases: string[];
  movementType: "compound" | "isolation";
  hidden?: boolean;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  trainingDays: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDay {
  id: string;
  routineId: string;
  name: string;
  dayOrder: number;
}

export interface RoutineExercise {
  id: string;
  routineDayId: string;
  exerciseId: string;
  exerciseOrder: number;
  notes: string;
  progressionNotes: string;
  supersetGroupId?: string;
}

export interface RoutineSetTarget {
  id: string;
  routineExerciseId: string;
  setNumber: number;
  targetWeight?: string;
  targetReps: string;
  restSeconds: number;
  intensity: string;
  drops?: RoutineDropTarget[];
}

export interface RoutineDropTarget {
  id: string;
  reps: string;
  weight: string;
}

export interface ExerciseGroup {
  id: string;
  userId: string;
  routineDayId?: string;
  workoutSessionId?: string;
  groupType: GroupType;
  label: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  routineDayId: string;
  startedAt: string;
  stoppedAt?: string;
  pausedAt?: string;
  totalPausedSeconds: number;
  computedDurationSeconds: number;
  status: SessionStatus;
  notes: string;
}

export interface WorkoutExercise {
  id: string;
  workoutSessionId: string;
  routineExerciseId?: string;
  exerciseId: string;
  exerciseOrder: number;
  notes: string;
  supersetGroupId?: string;
}

export interface PerformedSet {
  id: string;
  workoutExerciseId: string;
  exerciseId: string;
  workoutSessionId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup: boolean;
  isFailure: boolean;
  setType: SetType;
  parentSetId?: string;
  dropIndex?: number;
  supersetGroupId?: string;
  notes: string;
  completedAt: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  measuredAt: string;
  bodyWeight?: number;
  weakAreas: BodyPart[];
  notes: string;
}

export interface ExercisePreference {
  id: string;
  userId: string;
  exerciseId: string;
  preference: "liked" | "disliked" | "preferred";
  notes: string;
}

export interface TrackerState {
  userId: string;
  exercises: Exercise[];
  routines: Routine[];
  routineDays: RoutineDay[];
  routineExercises: RoutineExercise[];
  routineSetTargets: RoutineSetTarget[];
  exerciseGroups: ExerciseGroup[];
  workoutSessions: WorkoutSession[];
  workoutExercises: WorkoutExercise[];
  performedSets: PerformedSet[];
  bodyMeasurements: BodyMeasurement[];
  exercisePreferences: ExercisePreference[];
}

export interface ExerciseLibraryFilters {
  query: string;
  bodyPart: "all" | BodyPart;
  equipment: "all" | string;
}
