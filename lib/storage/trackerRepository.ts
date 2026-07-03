"use client";

import { initialTrackerState } from "@/lib/data/seed";
import type {
  PerformedSet,
  Routine,
  RoutineDay,
  RoutineExercise,
  RoutineSetTarget,
  SetType,
  TrackerState,
  WorkoutExercise,
  WorkoutSession,
} from "@/lib/domain/types";

const STORAGE_VERSION = "v1";
const storageKey = `strength-tracker-phase-1-state:${STORAGE_VERSION}`;
const legacyStorageKey = "strength-tracker-phase-1-state";

export interface TrackerRepository {
  load(): TrackerState;
  save(state: TrackerState): void;
  reset(): TrackerState;
}

export const localTrackerRepository: TrackerRepository = {
  load() {
    if (typeof window === "undefined") {
      return initialTrackerState;
    }

    try {
      const raw =
        window.localStorage.getItem(storageKey) ??
        window.localStorage.getItem(legacyStorageKey);
      if (!raw) {
        this.save(initialTrackerState);
        return initialTrackerState;
      }

      return JSON.parse(raw) as TrackerState;
    } catch {
      this.save(initialTrackerState);
      return initialTrackerState;
    }
  },
  save(state) {
    try {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Local storage can be unavailable in private browsing or constrained embeds.
    }
  },
  reset() {
    this.save(initialTrackerState);
    return initialTrackerState;
  },
};

export const supabaseRepositoryStatus = {
  mode: "local-dev-fallback",
  reason:
    "Supabase URL/key are intentionally optional for Phase 1 local development. UI code talks to the repository boundary so a Supabase implementation can replace this adapter.",
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function duplicateRoutine(state: TrackerState, routineId: string) {
  const routine = state.routines.find((item) => item.id === routineId);
  if (!routine) {
    return state;
  }

  const now = new Date().toISOString();
  const newRoutine: Routine = {
    ...routine,
    id: createId("routine"),
    name: `${routine.name} Copy`,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  const dayMap = new Map<string, string>();
  const exerciseMap = new Map<string, string>();
  const copiedDays: RoutineDay[] = state.routineDays
    .filter((day) => day.routineId === routineId)
    .map((day) => {
      const id = createId("day");
      dayMap.set(day.id, id);
      return { ...day, id, routineId: newRoutine.id };
    });

  const copiedExercises: RoutineExercise[] = state.routineExercises
    .filter((exercise) => dayMap.has(exercise.routineDayId))
    .map((exercise) => {
      const id = createId("routine-exercise");
      exerciseMap.set(exercise.id, id);
      return {
        ...exercise,
        id,
        routineDayId: dayMap.get(exercise.routineDayId)!,
      };
    });

  const copiedTargets: RoutineSetTarget[] = state.routineSetTargets
    .filter((target) => exerciseMap.has(target.routineExerciseId))
    .map((target) => ({
      ...target,
      id: createId("target"),
      routineExerciseId: exerciseMap.get(target.routineExerciseId)!,
    }));

  return {
    ...state,
    routines: [...state.routines, newRoutine],
    routineDays: [...state.routineDays, ...copiedDays],
    routineExercises: [...state.routineExercises, ...copiedExercises],
    routineSetTargets: [...state.routineSetTargets, ...copiedTargets],
  };
}

export function archiveRoutine(state: TrackerState, routineId: string) {
  return {
    ...state,
    routines: state.routines.map((routine) =>
      routine.id === routineId
        ? { ...routine, archived: true, updatedAt: new Date().toISOString() }
        : routine
    ),
  };
}

export function deleteRoutine(state: TrackerState, routineId: string) {
  const dayIds = new Set(
    state.routineDays
      .filter((day) => day.routineId === routineId)
      .map((day) => day.id)
  );
  const routineExerciseIds = new Set(
    state.routineExercises
      .filter((exercise) => dayIds.has(exercise.routineDayId))
      .map((exercise) => exercise.id)
  );

  return {
    ...state,
    routines: state.routines.filter((routine) => routine.id !== routineId),
    routineDays: state.routineDays.filter((day) => !dayIds.has(day.id)),
    routineExercises: state.routineExercises.filter(
      (exercise) => !routineExerciseIds.has(exercise.id)
    ),
    routineSetTargets: state.routineSetTargets.filter(
      (target) => !routineExerciseIds.has(target.routineExerciseId)
    ),
    exerciseGroups: state.exerciseGroups.filter(
      (group) => !group.routineDayId || !dayIds.has(group.routineDayId)
    ),
  };
}

export function addExerciseToRoutineDay(
  state: TrackerState,
  routineDayId: string,
  exerciseId: string
) {
  const existing = state.routineExercises.filter(
    (item) => item.routineDayId === routineDayId
  );
  const routineExercise: RoutineExercise = {
    id: createId("routine-exercise"),
    routineDayId,
    exerciseId,
    exerciseOrder: existing.length + 1,
    notes: "",
    progressionNotes: "Add reps first, then add load when all sets are clean.",
  };
  const targets: RoutineSetTarget[] = [1, 2, 3].map((setNumber) => ({
    id: createId("target"),
    routineExerciseId: routineExercise.id,
    setNumber,
    targetWeight: "",
    targetReps: "8-12",
    restSeconds: 90,
    intensity: "1-2 reps in reserve",
  }));

  return {
    ...state,
    routineExercises: [...state.routineExercises, routineExercise],
    routineSetTargets: [...state.routineSetTargets, ...targets],
  };
}

export function addRoutineSetTarget(
  state: TrackerState,
  routineExerciseId: string
) {
  const existing = state.routineSetTargets
    .filter((target) => target.routineExerciseId === routineExerciseId)
    .sort((a, b) => a.setNumber - b.setNumber);
  const previous = existing.at(-1);

  return {
    ...state,
    routineSetTargets: [
      ...state.routineSetTargets,
      {
        id: createId("target"),
        routineExerciseId,
        setNumber: existing.length + 1,
        targetWeight: previous?.targetWeight ?? "",
        targetReps: previous?.targetReps ?? "8-12",
        restSeconds: previous?.restSeconds ?? 90,
        intensity: previous?.intensity ?? "1-2 reps in reserve",
      },
    ],
  };
}

export function deleteRoutineExercise(
  state: TrackerState,
  routineExerciseId: string
) {
  const routineExercise = state.routineExercises.find(
    (item) => item.id === routineExerciseId
  );
  if (!routineExercise) {
    return state;
  }

  const remainingForDay = state.routineExercises
    .filter(
      (item) =>
        item.routineDayId === routineExercise.routineDayId &&
        item.id !== routineExerciseId
    )
    .sort((a, b) => a.exerciseOrder - b.exerciseOrder);
  const orderMap = new Map(
    remainingForDay.map((item, index) => [item.id, index + 1])
  );
  const groupId = routineExercise.supersetGroupId;
  const remainingGroupMembers = groupId
    ? state.routineExercises.filter(
        (item) => item.id !== routineExerciseId && item.supersetGroupId === groupId
      )
    : [];
  const shouldRemoveGroup = Boolean(groupId && remainingGroupMembers.length < 2);

  return {
    ...state,
    routineExercises: state.routineExercises
      .filter((item) => item.id !== routineExerciseId)
      .map((item) =>
        orderMap.has(item.id) || (shouldRemoveGroup && item.supersetGroupId === groupId)
          ? {
              ...item,
              exerciseOrder: orderMap.get(item.id) ?? item.exerciseOrder,
              supersetGroupId:
                shouldRemoveGroup && item.supersetGroupId === groupId
                  ? undefined
                  : item.supersetGroupId,
            }
          : item
      ),
    routineSetTargets: state.routineSetTargets.filter(
      (target) => target.routineExerciseId !== routineExerciseId
    ),
    exerciseGroups: state.exerciseGroups.filter((group) => {
      if (group.id !== groupId) {
        return true;
      }

      return !shouldRemoveGroup;
    }),
  };
}

export function startWorkoutFromRoutineDay(
  state: TrackerState,
  routineId: string,
  routineDayId: string
) {
  const session: WorkoutSession = {
    id: createId("session"),
    userId: state.userId,
    routineId,
    routineDayId,
    startedAt: new Date().toISOString(),
    totalPausedSeconds: 0,
    computedDurationSeconds: 0,
    status: "active",
    notes: "",
  };

  const workoutExercises: WorkoutExercise[] = state.routineExercises
    .filter((item) => item.routineDayId === routineDayId)
    .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
    .map((routineExercise) => ({
      id: createId("workout-exercise"),
      workoutSessionId: session.id,
      routineExerciseId: routineExercise.id,
      exerciseId: routineExercise.exerciseId,
      exerciseOrder: routineExercise.exerciseOrder,
      notes: "",
      supersetGroupId: routineExercise.supersetGroupId,
    }));

  return {
    state: {
      ...state,
      workoutSessions: [...state.workoutSessions, session],
      workoutExercises: [...state.workoutExercises, ...workoutExercises],
    },
    sessionId: session.id,
  };
}

export function pauseSession(state: TrackerState, sessionId: string) {
  return {
    ...state,
    workoutSessions: state.workoutSessions.map((session) =>
      session.id === sessionId && session.status === "active"
        ? { ...session, status: "paused" as const, pausedAt: new Date().toISOString() }
        : session
    ),
  };
}

export function resumeSession(state: TrackerState, sessionId: string) {
  const now = Date.now();
  return {
    ...state,
    workoutSessions: state.workoutSessions.map((session) => {
      if (session.id !== sessionId || session.status !== "paused" || !session.pausedAt) {
        return session;
      }

      return {
        ...session,
        status: "active" as const,
        totalPausedSeconds:
          session.totalPausedSeconds +
          Math.max(0, Math.floor((now - new Date(session.pausedAt).getTime()) / 1000)),
        pausedAt: undefined,
      };
    }),
  };
}

export function completeSession(state: TrackerState, sessionId: string) {
  const stoppedAt = new Date();
  return {
    ...state,
    workoutSessions: state.workoutSessions.map((session) => {
      if (session.id !== sessionId) {
        return session;
      }

      const pausedRemainder =
        session.status === "paused" && session.pausedAt
          ? Math.max(
              0,
              Math.floor((stoppedAt.getTime() - new Date(session.pausedAt).getTime()) / 1000)
            )
          : 0;
      const totalPausedSeconds = session.totalPausedSeconds + pausedRemainder;
      const computedDurationSeconds = Math.max(
        0,
        Math.floor((stoppedAt.getTime() - new Date(session.startedAt).getTime()) / 1000) -
          totalPausedSeconds
      );

      return {
        ...session,
        status: "completed" as const,
        stoppedAt: stoppedAt.toISOString(),
        pausedAt: undefined,
        totalPausedSeconds,
        computedDurationSeconds,
      };
    }),
  };
}

export function discardSession(state: TrackerState, sessionId: string) {
  const workoutExerciseIds = new Set(
    state.workoutExercises
      .filter((exercise) => exercise.workoutSessionId === sessionId)
      .map((exercise) => exercise.id)
  );

  return {
    ...state,
    workoutSessions: state.workoutSessions.filter(
      (session) => session.id !== sessionId
    ),
    workoutExercises: state.workoutExercises.filter(
      (exercise) => exercise.workoutSessionId !== sessionId
    ),
    performedSets: state.performedSets.filter(
      (set) =>
        set.workoutSessionId !== sessionId &&
        !workoutExerciseIds.has(set.workoutExerciseId)
    ),
  };
}

export function addPerformedSet(
  state: TrackerState,
  workoutExerciseId: string,
  values: {
    weight: number;
    reps: number;
    setType: SetType;
    isFailure: boolean;
    setNumber?: number;
    dropIndex?: number;
    notes?: string;
    parentSetId?: string;
  }
) {
  const workoutExercise = state.workoutExercises.find(
    (item) => item.id === workoutExerciseId
  );
  if (!workoutExercise) {
    return state;
  }

  const siblings = state.performedSets.filter(
    (set) => set.workoutExerciseId === workoutExerciseId
  );
  const parentDrops = values.parentSetId
    ? state.performedSets.filter((set) => set.parentSetId === values.parentSetId)
    : [];
  const fallbackSetNumber =
    values.setType === "drop" && values.parentSetId
      ? state.performedSets.find((set) => set.id === values.parentSetId)?.setNumber ??
        siblings.length + 1
      : siblings.filter((set) => !set.parentSetId).length + 1;
  const setNumber = values.setNumber ?? fallbackSetNumber;

  const performedSet: PerformedSet = {
    id: createId("set"),
    workoutExerciseId,
    exerciseId: workoutExercise.exerciseId,
    workoutSessionId: workoutExercise.workoutSessionId,
    setNumber,
    weight: values.weight,
    reps: values.reps,
    isWarmup: values.setType === "warmup",
    isFailure: values.isFailure,
    setType: values.setType,
    parentSetId: values.parentSetId,
    dropIndex:
      values.setType === "drop" && values.parentSetId
        ? values.dropIndex ?? parentDrops.length + 1
        : undefined,
    supersetGroupId: workoutExercise.supersetGroupId,
    notes: values.notes ?? "",
    completedAt: new Date().toISOString(),
  };

  return {
    ...state,
    performedSets: [...state.performedSets, performedSet],
  };
}

export function deletePerformedSet(state: TrackerState, performedSetId: string) {
  return {
    ...state,
    performedSets: state.performedSets.filter(
      (set) => set.id !== performedSetId && set.parentSetId !== performedSetId
    ),
  };
}
