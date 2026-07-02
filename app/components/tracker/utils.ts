import type { Exercise, TrackerState } from "@/lib/domain/types";

export const emptySets: TrackerState["performedSets"] = [];

export function buildExerciseMap(exercises: Exercise[]) {
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}

export function groupPerformedSetsByWorkoutExercise(
  performedSets: TrackerState["performedSets"]
) {
  const grouped = new Map<string, TrackerState["performedSets"]>();
  for (const set of performedSets) {
    const sets = grouped.get(set.workoutExerciseId);
    if (sets) {
      sets.push(set);
    } else {
      grouped.set(set.workoutExerciseId, [set]);
    }
  }

  for (const [workoutExerciseId, sets] of grouped) {
    grouped.set(
      workoutExerciseId,
      sets.toSorted(
        (a, b) =>
          a.setNumber - b.setNumber || (a.dropIndex ?? 0) - (b.dropIndex ?? 0)
      )
    );
  }

  return grouped;
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
