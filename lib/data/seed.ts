import type {
  Exercise,
  ExerciseGroup,
  PerformedSet,
  Routine,
  RoutineDay,
  RoutineExercise,
  RoutineSetTarget,
  TrackerState,
  WorkoutExercise,
  WorkoutSession,
} from "@/lib/domain/types";
import generatedExerciseDbExercises from "./exercisedb.generated.json";

const userId = "dev-guest";
const now = new Date("2026-07-01T10:00:00.000Z").toISOString();

export const seededExercises: Exercise[] = [
  {
    id: "barbell-bench-press",
    sourceExerciseId: "seed-barbell-bench-press",
    name: "Barbell Bench Press",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/bench-press/bench-press-800.jpg",
    bodyParts: ["chest", "triceps", "shoulders"],
    targetMuscles: ["pectoralis major"],
    secondaryMuscles: ["anterior delts", "triceps"],
    equipment: ["barbell", "bench"],
    instructions: [
      "Set the shoulder blades down and back before unracking.",
      "Lower the bar under control to the lower chest.",
      "Press up while keeping the feet planted and elbows stacked.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["bench", "bb bench", "flat bench"],
    movementType: "compound",
  },
  {
    id: "incline-dumbbell-press",
    sourceExerciseId: "seed-incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/incline-dumbbell-bench-press/incline-dumbbell-bench-press-800.jpg",
    bodyParts: ["chest", "shoulders", "triceps"],
    targetMuscles: ["upper chest"],
    secondaryMuscles: ["anterior delts", "triceps"],
    equipment: ["dumbbells", "bench"],
    instructions: [
      "Set the bench to a modest incline.",
      "Keep the dumbbells over the elbows through the press.",
      "Stop just short of losing shoulder position at the bottom.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["db incline", "incline db press"],
    movementType: "compound",
  },
  {
    id: "barbell-row",
    sourceExerciseId: "seed-barbell-row",
    name: "Barbell Row",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/bent-over-row/bent-over-row-800.jpg",
    bodyParts: ["back", "biceps"],
    targetMuscles: ["lats", "mid back"],
    secondaryMuscles: ["rear delts", "biceps", "spinal erectors"],
    equipment: ["barbell"],
    instructions: [
      "Hinge until the torso is close to parallel with the floor.",
      "Pull the bar toward the lower ribs.",
      "Keep the torso angle stable through each rep.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["bb row", "bent over row"],
    movementType: "compound",
  },
  {
    id: "lat-pulldown",
    sourceExerciseId: "seed-lat-pulldown",
    name: "Lat Pulldown",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/lat-pulldown/lat-pulldown-800.jpg",
    bodyParts: ["back", "biceps"],
    targetMuscles: ["lats"],
    secondaryMuscles: ["biceps", "teres major"],
    equipment: ["cable", "machine"],
    instructions: [
      "Set the thigh pad snugly.",
      "Pull the elbows down toward the ribs.",
      "Control the return without shrugging.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["pulldown", "cable pulldown"],
    movementType: "compound",
  },
  {
    id: "back-squat",
    sourceExerciseId: "seed-back-squat",
    name: "Back Squat",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/squat/squat-800.jpg",
    bodyParts: ["quads", "hamstrings_glutes", "core"],
    targetMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "adductors", "core"],
    equipment: ["barbell", "rack"],
    instructions: [
      "Brace before descending.",
      "Keep the bar path over the mid-foot.",
      "Drive up without letting the hips shoot back early.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["squat", "bb squat"],
    movementType: "compound",
  },
  {
    id: "romanian-deadlift",
    sourceExerciseId: "seed-romanian-deadlift",
    name: "Romanian Deadlift",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/romanian-deadlift/romanian-deadlift-800.jpg",
    bodyParts: ["hamstrings_glutes", "back"],
    targetMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["spinal erectors", "lats"],
    equipment: ["barbell"],
    instructions: [
      "Start from standing with the bar close to the thighs.",
      "Push the hips back while keeping a soft knee bend.",
      "Stand tall when the hamstrings finish the stretch.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["rdl", "barbell rdl"],
    movementType: "compound",
  },
  {
    id: "overhead-press",
    sourceExerciseId: "seed-overhead-press",
    name: "Overhead Press",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/shoulder-press/shoulder-press-800.jpg",
    bodyParts: ["shoulders", "triceps", "core"],
    targetMuscles: ["delts"],
    secondaryMuscles: ["triceps", "upper chest", "core"],
    equipment: ["barbell"],
    instructions: [
      "Brace hard before the press.",
      "Move the head back just enough for a vertical bar path.",
      "Finish with the biceps near the ears.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["ohp", "barbell press"],
    movementType: "compound",
  },
  {
    id: "cable-row",
    sourceExerciseId: "seed-cable-row",
    name: "Cable Row",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/seated-cable-row/seated-cable-row-800.jpg",
    bodyParts: ["back", "biceps"],
    targetMuscles: ["mid back"],
    secondaryMuscles: ["lats", "rear delts", "biceps"],
    equipment: ["cable", "machine"],
    instructions: [
      "Sit tall with ribs stacked over the hips.",
      "Pull the handle toward the lower ribs.",
      "Pause briefly before a controlled return.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["seated cable row", "machine row"],
    movementType: "compound",
  },
  {
    id: "dumbbell-lateral-raise",
    sourceExerciseId: "seed-dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/dumbbell-lateral-raise/dumbbell-lateral-raise-800.jpg",
    bodyParts: ["shoulders"],
    targetMuscles: ["side delts"],
    secondaryMuscles: ["traps"],
    equipment: ["dumbbells"],
    instructions: [
      "Raise the dumbbells with a slight elbow bend.",
      "Stop near shoulder height.",
      "Lower slowly and avoid swinging.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["side raise", "lat raise"],
    movementType: "isolation",
  },
  {
    id: "triceps-pressdown",
    sourceExerciseId: "seed-triceps-pressdown",
    name: "Triceps Pressdown",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/tricep-pushdown/tricep-pushdown-800.jpg",
    bodyParts: ["triceps"],
    targetMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: ["cable"],
    instructions: [
      "Pin the elbows near the ribs.",
      "Press the handle down until the elbows are fully extended.",
      "Let the hands return without the shoulders rolling forward.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["pushdown", "cable pressdown"],
    movementType: "isolation",
  },
  {
    id: "dumbbell-curl",
    sourceExerciseId: "seed-dumbbell-curl",
    name: "Dumbbell Curl",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/dumbbell-curl/dumbbell-curl-800.jpg",
    bodyParts: ["biceps"],
    targetMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: ["dumbbells"],
    instructions: [
      "Keep the upper arms mostly still.",
      "Curl through a full range without leaning back.",
      "Lower with control.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["db curl", "biceps curl"],
    movementType: "isolation",
  },
  {
    id: "standing-calf-raise",
    sourceExerciseId: "seed-standing-calf-raise",
    name: "Standing Calf Raise",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/standing-calf-raise/standing-calf-raise-800.jpg",
    bodyParts: ["calves"],
    targetMuscles: ["gastrocnemius"],
    secondaryMuscles: ["soleus"],
    equipment: ["machine"],
    instructions: [
      "Use a deep stretch at the bottom.",
      "Rise onto the balls of the feet.",
      "Pause briefly at the top before lowering.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["calf raise"],
    movementType: "isolation",
  },
  {
    id: "hanging-leg-raise",
    sourceExerciseId: "seed-hanging-leg-raise",
    name: "Hanging Leg Raise",
    gifUrl:
      "https://static.strengthlevel.com/images/exercises/hanging-leg-raise/hanging-leg-raise-800.jpg",
    bodyParts: ["core"],
    targetMuscles: ["abs"],
    secondaryMuscles: ["hip flexors"],
    equipment: ["pull-up bar"],
    instructions: [
      "Hang with the shoulders active.",
      "Raise the legs without swinging.",
      "Control the descent and reset before the next rep.",
    ],
    source: "curated_seed",
    isStrength: true,
    aliases: ["leg raise", "hanging abs"],
    movementType: "isolation",
  },
];

const exerciseDbExercises = generatedExerciseDbExercises as Exercise[];
const exerciseDbExerciseByName = new Map(
  exerciseDbExercises.map((exercise) => [exercise.name.toLowerCase(), exercise])
);
const exerciseDbSeedNameAliases = new Map([
  ["incline-dumbbell-press", "Dumbbell Incline Bench Press"],
  ["barbell-row", "Barbell Bent Over Row"],
  ["lat-pulldown", "Cable Lat Pulldown Full Range Of Motion"],
  ["back-squat", "Barbell Full Squat"],
  ["romanian-deadlift", "Barbell Romanian Deadlift"],
  ["overhead-press", "Barbell Standing Wide Military Press"],
  ["cable-row", "Cable Seated Row"],
  ["triceps-pressdown", "Cable Triceps Pushdown (V-Bar)"],
  ["dumbbell-curl", "Dumbbell Biceps Curl"],
  ["standing-calf-raise", "Bodyweight Standing Calf Raise"],
]);
const seedExerciseIdToLibraryId = new Map(
  seededExercises.map((exercise) => [
    exercise.id,
    findExerciseDbExerciseForSeed(exercise)?.id ?? exercise.id,
  ])
);
const missingSeededExercises = seededExercises.filter(
  (exercise) => !findExerciseDbExerciseForSeed(exercise)
);

export const libraryExercises: Exercise[] =
  exerciseDbExercises.length > 0
    ? [...exerciseDbExercises, ...missingSeededExercises]
    : seededExercises;

const routine: Routine = {
  id: "routine-upper-lower",
  userId,
  name: "4-Day Upper Lower Strength",
  trainingDays: 4,
  archived: false,
  createdAt: now,
  updatedAt: now,
};

const routineDays: RoutineDay[] = [
  { id: "day-upper-a", routineId: routine.id, name: "Upper A", dayOrder: 1 },
  { id: "day-lower-a", routineId: routine.id, name: "Lower A", dayOrder: 2 },
  { id: "day-upper-b", routineId: routine.id, name: "Upper B", dayOrder: 3 },
  { id: "day-lower-b", routineId: routine.id, name: "Lower B", dayOrder: 4 },
];

const exerciseGroups: ExerciseGroup[] = [
  {
    id: "group-upper-a-arms",
    userId,
    routineDayId: "day-upper-a",
    groupType: "superset",
    label: "Arms finisher",
  },
];

const routineExercises: RoutineExercise[] = [
  makeRoutineExercise("re-bench", "day-upper-a", libraryExerciseId("barbell-bench-press"), 1),
  makeRoutineExercise("re-row", "day-upper-a", libraryExerciseId("barbell-row"), 2),
  makeRoutineExercise(
    "re-incline",
    "day-upper-a",
    libraryExerciseId("incline-dumbbell-press"),
    3
  ),
  makeRoutineExercise(
    "re-lateral",
    "day-upper-a",
    libraryExerciseId("dumbbell-lateral-raise"),
    4
  ),
  makeRoutineExercise(
    "re-pressdown",
    "day-upper-a",
    libraryExerciseId("triceps-pressdown"),
    5,
    "group-upper-a-arms"
  ),
  makeRoutineExercise(
    "re-curl",
    "day-upper-a",
    libraryExerciseId("dumbbell-curl"),
    6,
    "group-upper-a-arms"
  ),
  makeRoutineExercise("re-squat", "day-lower-a", libraryExerciseId("back-squat"), 1),
  makeRoutineExercise("re-rdl", "day-lower-a", libraryExerciseId("romanian-deadlift"), 2),
  makeRoutineExercise("re-calf", "day-lower-a", libraryExerciseId("standing-calf-raise"), 3),
  makeRoutineExercise("re-leg-raise", "day-lower-a", libraryExerciseId("hanging-leg-raise"), 4),
];

const routineSetTargets: RoutineSetTarget[] = routineExercises.flatMap((item) =>
  targetSetsFor(item)
);

const workoutSession: WorkoutSession = {
  id: "session-seed-upper-a",
  userId,
  routineId: routine.id,
  routineDayId: "day-upper-a",
  startedAt: "2026-06-30T11:00:00.000Z",
  stoppedAt: "2026-06-30T12:04:00.000Z",
  totalPausedSeconds: 240,
  computedDurationSeconds: 3600,
  status: "completed",
  notes: "Bench moved well. Keep hamstrings on the radar this week.",
};

const workoutExercises: WorkoutExercise[] = routineExercises
  .filter((item) => item.routineDayId === "day-upper-a")
  .map((item) => ({
    id: `we-${item.id}`,
    workoutSessionId: workoutSession.id,
    routineExerciseId: item.id,
    exerciseId: item.exerciseId,
    exerciseOrder: item.exerciseOrder,
    notes: "",
    supersetGroupId: item.supersetGroupId,
  }));

const performedSets: PerformedSet[] = [
  set("ps-bench-1", "we-re-bench", libraryExerciseId("barbell-bench-press"), 1, 60, 8, "warmup"),
  set("ps-bench-2", "we-re-bench", libraryExerciseId("barbell-bench-press"), 2, 92.5, 5),
  set("ps-bench-3", "we-re-bench", libraryExerciseId("barbell-bench-press"), 3, 92.5, 5),
  set("ps-bench-4", "we-re-bench", libraryExerciseId("barbell-bench-press"), 4, 92.5, 4, "normal", true),
  set("ps-row-1", "we-re-row", libraryExerciseId("barbell-row"), 1, 82.5, 8),
  set("ps-row-2", "we-re-row", libraryExerciseId("barbell-row"), 2, 82.5, 8),
  set("ps-row-3", "we-re-row", libraryExerciseId("barbell-row"), 3, 82.5, 7),
  set("ps-incline-1", "we-re-incline", libraryExerciseId("incline-dumbbell-press"), 1, 30, 9),
  set("ps-incline-2", "we-re-incline", libraryExerciseId("incline-dumbbell-press"), 2, 30, 8),
  set("ps-lateral-1", "we-re-lateral", libraryExerciseId("dumbbell-lateral-raise"), 1, 10, 15),
  set("ps-lateral-drop", "we-re-lateral", libraryExerciseId("dumbbell-lateral-raise"), 2, 7.5, 10, "drop"),
  set("ps-pressdown-1", "we-re-pressdown", libraryExerciseId("triceps-pressdown"), 1, 35, 12),
  set("ps-curl-1", "we-re-curl", libraryExerciseId("dumbbell-curl"), 1, 14, 10),
];

performedSets.find((item) => item.id === "ps-lateral-drop")!.parentSetId =
  "ps-lateral-1";
performedSets.find((item) => item.id === "ps-lateral-drop")!.dropIndex = 1;

export const initialTrackerState: TrackerState = {
  userId,
  exercises: libraryExercises,
  routines: [routine],
  routineDays,
  routineExercises,
  routineSetTargets,
  exerciseGroups,
  workoutSessions: [workoutSession],
  workoutExercises,
  performedSets,
  bodyMeasurements: [
    {
      id: "measurement-seed",
      userId,
      measuredAt: "2026-06-29T08:00:00.000Z",
      bodyWeight: 82.4,
      weakAreas: ["hamstrings_glutes", "shoulders"],
      notes: "Upper chest and hamstrings are current focus areas.",
    },
  ],
  exercisePreferences: [
    {
      id: "pref-bench",
      userId,
      exerciseId: libraryExerciseId("barbell-bench-press"),
      preference: "preferred",
      notes: "Main upper-body strength marker.",
    },
  ],
};

function makeRoutineExercise(
  id: string,
  routineDayId: string,
  exerciseId: string,
  exerciseOrder: number,
  supersetGroupId?: string
): RoutineExercise {
  return {
    id,
    routineDayId,
    exerciseId,
    exerciseOrder,
    notes: "",
    progressionNotes:
      exerciseOrder <= 2
        ? "Add load when all top sets hit the high end of the rep target."
        : "Add reps first, then add a small load jump.",
    supersetGroupId,
  };
}

function libraryExerciseId(seedExerciseId: string) {
  return seedExerciseIdToLibraryId.get(seedExerciseId) ?? seedExerciseId;
}

function findExerciseDbExerciseForSeed(exercise: Exercise) {
  const alias = exerciseDbSeedNameAliases.get(exercise.id);
  return (
    exerciseDbExerciseByName.get(exercise.name.toLowerCase()) ??
    (alias ? exerciseDbExerciseByName.get(alias.toLowerCase()) : undefined)
  );
}

function targetSetsFor(item: RoutineExercise): RoutineSetTarget[] {
  const compound = ["barbell-bench-press", "barbell-row", "back-squat"].includes(
    item.exerciseId
  );
  const sets = compound ? 4 : 3;
  const reps = compound ? "4-6" : "8-12";
  return Array.from({ length: sets }, (_, index) => ({
    id: `target-${item.id}-${index + 1}`,
    routineExerciseId: item.id,
    setNumber: index + 1,
    targetWeight: "",
    targetReps: reps,
    restSeconds: compound ? 180 : 75,
    intensity: compound ? "RPE 7-9" : "1-2 reps in reserve",
  }));
}

function set(
  id: string,
  workoutExerciseId: string,
  exerciseId: string,
  setNumber: number,
  weight: number,
  reps: number,
  setType: PerformedSet["setType"] = "normal",
  isFailure = false
): PerformedSet {
  return {
    id,
    workoutExerciseId,
    exerciseId,
    workoutSessionId: workoutSession.id,
    setNumber,
    weight,
    reps,
    rpe: isFailure ? 10 : undefined,
    isWarmup: setType === "warmup",
    isFailure,
    setType,
    notes: "",
    completedAt: "2026-06-30T11:30:00.000Z",
  };
}
