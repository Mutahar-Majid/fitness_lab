import type {
  BodyPart,
  Exercise,
  PerformedSet,
  RoutineDay,
  RoutineExercise,
  RoutineSetTarget,
  TrackerState,
  WorkoutExercise,
  WorkoutSession,
} from "@/lib/domain/types";

export const bodyPartLabels: Record<BodyPart, string> = {
  chest: "Chest",
  back: "Back",
  quads: "Quads",
  hamstrings_glutes: "Hamstrings/glutes",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  calves: "Calves",
  core: "Core",
};

export const bodyPartOrder: BodyPart[] = [
  "chest",
  "back",
  "quads",
  "hamstrings_glutes",
  "shoulders",
  "biceps",
  "triceps",
  "calves",
  "core",
];

export function estimatedOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function setVolume(set: Pick<PerformedSet, "weight" | "reps" | "setType">) {
  if (set.setType === "skipped") {
    return 0;
  }

  return set.weight * set.reps;
}

export function getCompletedDuration(session: WorkoutSession, now = new Date()) {
  if (session.status === "completed") {
    return session.computedDurationSeconds;
  }

  const started = new Date(session.startedAt).getTime();
  const current = session.status === "paused" && session.pausedAt
    ? new Date(session.pausedAt).getTime()
    : now.getTime();

  return Math.max(
    0,
    Math.floor((current - started) / 1000) - session.totalPausedSeconds
  );
}

export function summarizeAnalytics(state: TrackerState) {
  const completedSessions = state.workoutSessions.filter(
    (session) => session.status === "completed"
  );
  const workingSets = state.performedSets.filter(
    (set) => !set.isWarmup && set.setType !== "skipped"
  );
  const sessionVolume = workingSets.reduce((total, set) => total + setVolume(set), 0);
  const prs = detectOneRepMaxPrs(state);
  const coverage = weeklyBodyPartCoverage(state);
  const skippedBodyParts = detectSkippedBodyParts(state);
  const stalledExercises = detectStalledExercises(state);

  return {
    completedSessions,
    workingSets,
    sessionVolume,
    prs,
    coverage,
    skippedBodyParts,
    stalledExercises,
    bestExercises: bestExercisesByVolume(state).slice(0, 4),
    focus:
      skippedBodyParts.length > 0
        ? `Bring ${skippedBodyParts.map((part) => bodyPartLabels[part]).join(", ")} back into the week.`
        : stalledExercises.length > 0
          ? `Keep the main lifts stable and add a small progression target for ${stalledExercises[0].exercise.name}.`
          : "Training balance looks good. Keep main compounds stable this block.",
  };
}

export function detectOneRepMaxPrs(state: TrackerState) {
  const exerciseById = buildExerciseIndex(state.exercises);
  const byExercise = new Map<string, { exercise: Exercise; set: PerformedSet; oneRm: number }>();

  for (const set of state.performedSets) {
    if (set.isWarmup || set.setType === "skipped" || set.reps <= 0) {
      continue;
    }

    const exercise = exerciseById.get(set.exerciseId);
    if (!exercise) {
      continue;
    }

    const oneRm = estimatedOneRepMax(set.weight, set.reps);
    const current = byExercise.get(set.exerciseId);
    if (!current || oneRm > current.oneRm) {
      byExercise.set(set.exerciseId, { exercise, set, oneRm });
    }
  }

  return Array.from(byExercise.values())
    .sort((a, b) => b.oneRm - a.oneRm)
    .slice(0, 5);
}

export function weeklyBodyPartCoverage(state: TrackerState) {
  const exerciseById = buildExerciseIndex(state.exercises);
  const coverage = Object.fromEntries(
    bodyPartOrder.map((part) => [part, 0])
  ) as Record<BodyPart, number>;

  for (const set of state.performedSets) {
    if (set.isWarmup || set.setType === "skipped") {
      continue;
    }

    const exercise = exerciseById.get(set.exerciseId);
    for (const bodyPart of exercise?.bodyParts ?? []) {
      coverage[bodyPart] += 1;
    }
  }

  return coverage;
}

export function plannedBodyPartExposure(state: TrackerState) {
  const exerciseById = buildExerciseIndex(state.exercises);
  const targetCountByRoutineExerciseId = new Map<string, number>();
  for (const target of state.routineSetTargets) {
    targetCountByRoutineExerciseId.set(
      target.routineExerciseId,
      (targetCountByRoutineExerciseId.get(target.routineExerciseId) ?? 0) + 1
    );
  }

  const exposure = Object.fromEntries(
    bodyPartOrder.map((part) => [part, 0])
  ) as Record<BodyPart, number>;

  for (const routineExercise of state.routineExercises) {
    const exercise = exerciseById.get(routineExercise.exerciseId);
    const targetCount = targetCountByRoutineExerciseId.get(routineExercise.id) ?? 0;

    for (const bodyPart of exercise?.bodyParts ?? []) {
      exposure[bodyPart] += targetCount;
    }
  }

  return exposure;
}

export function detectSkippedBodyParts(state: TrackerState) {
  const planned = plannedBodyPartExposure(state);
  const completed = weeklyBodyPartCoverage(state);

  return bodyPartOrder.filter(
    (part) => planned[part] >= 3 && completed[part] < Math.max(2, planned[part] * 0.35)
  );
}

export function detectStalledExercises(state: TrackerState) {
  const exerciseById = buildExerciseIndex(state.exercises);
  const byExercise = groupSetsByExercise(state.performedSets);
  const stalled: Array<{ exercise: Exercise; recentTopOneRm: number }> = [];

  for (const [exerciseId, sets] of byExercise) {
    const exercise = exerciseById.get(exerciseId);
    const workingSets = sets.filter((set) => !set.isWarmup && set.setType !== "skipped");
    if (!exercise || workingSets.length < 3) {
      continue;
    }

    const oneRms = workingSets.map((set) => estimatedOneRepMax(set.weight, set.reps));
    const recentTopOneRm = Math.max(...oneRms.slice(-3));
    const historicalTopOneRm = Math.max(...oneRms);
    if (recentTopOneRm <= historicalTopOneRm * 0.98) {
      stalled.push({ exercise, recentTopOneRm });
    }
  }

  return stalled.slice(0, 4);
}

export function bestExercisesByVolume(state: TrackerState) {
  const exerciseById = buildExerciseIndex(state.exercises);
  const volumeByExercise = new Map<string, number>();

  for (const set of state.performedSets) {
    volumeByExercise.set(
      set.exerciseId,
      (volumeByExercise.get(set.exerciseId) ?? 0) + setVolume(set)
    );
  }

  return Array.from(volumeByExercise.entries())
    .map(([exerciseId, volume]) => ({
      exercise: exerciseById.get(exerciseId),
      volume,
    }))
    .filter((item): item is { exercise: Exercise; volume: number } => Boolean(item.exercise))
    .sort((a, b) => b.volume - a.volume);
}

export function filterExercises(
  exercises: Exercise[],
  query: string,
  bodyPart: "all" | BodyPart,
  equipment: "all" | string
) {
  const normalized = query.trim().toLowerCase();

  return exercises.filter((exercise) => {
    if (exercise.hidden || !exercise.isStrength) {
      return false;
    }

    const matchesQuery =
      normalized.length === 0 ||
      [
        exercise.name,
        ...exercise.aliases,
        ...exercise.targetMuscles,
        ...exercise.secondaryMuscles,
        ...exercise.equipment,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);

    const matchesBodyPart =
      bodyPart === "all" || exercise.bodyParts.includes(bodyPart);
    const matchesEquipment =
      equipment === "all" || exercise.equipment.includes(equipment);

    return matchesQuery && matchesBodyPart && matchesEquipment;
  });
}

export function getRoutineDayExercises(
  state: TrackerState,
  routineDayId: string
): Array<{
  routineExercise: RoutineExercise;
  exercise: Exercise;
  targets: RoutineSetTarget[];
  group?: string;
}> {
  const exerciseById = buildExerciseIndex(state.exercises);
  const groupById = new Map(state.exerciseGroups.map((group) => [group.id, group]));
  const targetsByRoutineExerciseId = new Map<string, RoutineSetTarget[]>();
  for (const target of state.routineSetTargets) {
    const targets = targetsByRoutineExerciseId.get(target.routineExerciseId);
    if (targets) {
      targets.push(target);
    } else {
      targetsByRoutineExerciseId.set(target.routineExerciseId, [target]);
    }
  }

  return state.routineExercises
    .filter((item) => item.routineDayId === routineDayId)
    .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
    .flatMap((routineExercise) => {
      const exercise = exerciseById.get(routineExercise.exerciseId);
      if (!exercise) {
        return [];
      }

      return [
        {
          routineExercise,
          exercise,
          targets: targetsByRoutineExerciseId.get(routineExercise.id) ?? [],
          group: routineExercise.supersetGroupId
            ? groupById.get(routineExercise.supersetGroupId)?.label
            : undefined,
        },
      ];
    });
}

export function getWorkoutExerciseSets(
  workoutExercise: WorkoutExercise,
  sets: PerformedSet[]
) {
  return sets
    .filter((set) => set.workoutExerciseId === workoutExercise.id)
    .sort((a, b) => a.setNumber - b.setNumber || (a.dropIndex ?? 0) - (b.dropIndex ?? 0));
}

export function latestRoutineDay(state: TrackerState): RoutineDay | undefined {
  const activeRoutine = state.routines.find((routine) => !routine.archived);
  return state.routineDays
    .filter((day) => day.routineId === activeRoutine?.id)
    .sort((a, b) => a.dayOrder - b.dayOrder)[0];
}

export function groupSetsByExercise(sets: PerformedSet[]) {
  const grouped = new Map<string, PerformedSet[]>();
  for (const set of sets) {
    const exerciseSets = grouped.get(set.exerciseId);
    if (exerciseSets) {
      exerciseSets.push(set);
    } else {
      grouped.set(set.exerciseId, [set]);
    }
  }
  return grouped;
}

function buildExerciseIndex(exercises: Exercise[]) {
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}
