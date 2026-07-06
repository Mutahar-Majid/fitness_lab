"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterExercises,
  getCompletedDuration,
  getRoutineDayExercises,
  latestRoutineDay,
  summarizeAnalytics,
} from "@/lib/domain/analytics";
import { initialTrackerState } from "@/lib/data/seed";
import type { BodyPart, TrackerState } from "@/lib/domain/types";
import {
  addExerciseToRoutineDay,
  addRoutineSetTarget,
  addPerformedSet,
  completeSession,
  createId,
  deletePerformedSet,
  deleteRoutine,
  deleteRoutineExercise,
  discardSession,
  duplicateRoutine,
  localTrackerRepository,
  pauseSession,
  resumeSession,
  startWorkoutFromRoutineDay,
} from "@/lib/storage/trackerRepository";
import type { AddSetValues, Tab } from "@/app/components/tracker/types";
import {
  buildExerciseMap,
  groupPerformedSetsByWorkoutExercise,
} from "@/app/components/tracker/utils";

export function useStrengthTrackerState() {
  const [state, setState] = useState<TrackerState>(initialTrackerState);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedDayId, setSelectedDayId] = useState(
    () => latestRoutineDay(state)?.id ?? "",
  );
  const [activeSessionId, setActiveSessionId] = useState(
    () =>
      state.workoutSessions.find((session) => session.status !== "completed")
        ?.id ?? "",
  );
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [bodyPart, setBodyPart] = useState<"all" | BodyPart>("all");
  const [equipment, setEquipment] = useState("all");
  const [expandedExerciseId, setExpandedExerciseId] = useState("");
  const [draggedRoutineExerciseId, setDraggedRoutineExerciseId] = useState("");
  const [hasLoadedStoredState, setHasLoadedStoredState] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    window.queueMicrotask(() => {
      const loaded = localTrackerRepository.load();
      setState(loaded);
      setSelectedDayId(latestRoutineDay(loaded)?.id ?? "");
      setActiveSessionId(
        loaded.workoutSessions.find((session) => session.status !== "completed")
          ?.id ?? "",
      );
      setHasLoadedStoredState(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredState) {
      return;
    }

    localTrackerRepository.save(state);
  }, [hasLoadedStoredState, state]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const analytics = useMemo(() => summarizeAnalytics(state), [state]);
  const activeRoutine = useMemo(
    () => state.routines.find((routine) => !routine.archived),
    [state.routines],
  );
  const selectedDay = useMemo(
    () =>
      state.routineDays.find((day) => day.id === selectedDayId) ??
      latestRoutineDay(state),
    [selectedDayId, state],
  );
  const selectedDayExercises = useMemo(
    () => (selectedDay ? getRoutineDayExercises(state, selectedDay.id) : []),
    [selectedDay, state],
  );
  const activeSession = useMemo(
    () =>
      activeSessionId
        ? state.workoutSessions.find(
            (session) => session.id === activeSessionId,
          )
        : state.workoutSessions.find(
            (session) => session.status !== "completed",
          ),
    [activeSessionId, state.workoutSessions],
  );
  void tick;
  const activeWorkoutExercises = useMemo(
    () =>
      activeSession
        ? state.workoutExercises
            .filter((item) => item.workoutSessionId === activeSession.id)
            .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
        : [],
    [activeSession, state.workoutExercises],
  );
  const activeSessionDayExercises = useMemo(
    () =>
      activeSession
        ? getRoutineDayExercises(state, activeSession.routineDayId)
        : [],
    [activeSession, state],
  );
  const activeSessionDuration = activeSession
    ? getCompletedDuration(activeSession)
    : 0;
  const exerciseById = useMemo(
    () => buildExerciseMap(state.exercises),
    [state.exercises],
  );
  const setsByWorkoutExerciseId = useMemo(
    () => groupPerformedSetsByWorkoutExercise(state.performedSets),
    [state.performedSets],
  );
  const activeRoutineTargetsByRoutineExerciseId = useMemo(() => {
    const activeRoutineExerciseIds = new Set(
      activeWorkoutExercises
        .map((item) => item.routineExerciseId)
        .filter((id): id is string => Boolean(id)),
    );
    const grouped = new Map<string, TrackerState["routineSetTargets"]>();

    for (const target of state.routineSetTargets) {
      if (!activeRoutineExerciseIds.has(target.routineExerciseId)) {
        continue;
      }

      const current = grouped.get(target.routineExerciseId) ?? [];
      grouped.set(target.routineExerciseId, [...current, target]);
    }

    for (const targets of grouped.values()) {
      targets.sort((a, b) => a.setNumber - b.setNumber);
    }

    return grouped;
  }, [activeWorkoutExercises, state.routineSetTargets]);
  const filteredExercises = useMemo(
    () => filterExercises(state.exercises, exerciseQuery, bodyPart, equipment),
    [state.exercises, exerciseQuery, bodyPart, equipment],
  );
  const equipmentOptions = useMemo(
    () =>
      Array.from(
        new Set(state.exercises.flatMap((exercise) => exercise.equipment)),
      ).sort(),
    [state.exercises],
  );

  const persist = useCallback((nextState: TrackerState) => {
    setState(nextState);
  }, []);

  const replaceRoutineState = useCallback(
    (routineState: TrackerState) => {
      persist(mergeRoutineState(state, routineState));
    },
    [persist, state],
  );

  const startRoutineDay = useCallback(
    (routineDayId: string) => {
      const routineDay = state.routineDays.find(
        (day) => day.id === routineDayId,
      );
      if (!routineDay) {
        return;
      }

      const result = startWorkoutFromRoutineDay(
        state,
        routineDay.routineId,
        routineDay.id,
      );
      persist(result.state);
      setSelectedDayId(routineDay.id);
      setActiveSessionId(result.sessionId);
      setTab("workout");
    },
    [persist, state],
  );

  const startSelectedDay = useCallback(() => {
    if (!selectedDay) {
      return;
    }

    startRoutineDay(selectedDay.id);
  }, [selectedDay, startRoutineDay]);

  const createRoutine = useCallback(() => {
    const now = new Date().toISOString();
    const routineId = createId("routine");
    const dayId = createId("day");
    persist({
      ...state,
      routines: [
        ...state.routines,
        {
          id: routineId,
          userId: state.userId,
          name: "Custom Strength Block",
          trainingDays: 1,
          archived: false,
          createdAt: now,
          updatedAt: now,
        },
      ],
      routineDays: [
        ...state.routineDays,
        { id: dayId, routineId, name: "Day 1", dayOrder: 1 },
      ],
    });
    setSelectedDayId(dayId);
    setTab("builder");
  }, [persist, state]);

  const selectRoutineDay = useCallback((dayId: string) => {
    setSelectedDayId(dayId);
  }, []);

  const duplicateRoutineById = useCallback(
    (routineId: string) => persist(duplicateRoutine(state, routineId)),
    [persist, state],
  );

  const deleteRoutineById = useCallback(
    (routineId: string) => {
      const nextState = deleteRoutine(state, routineId);
      persist(nextState);
      setSelectedDayId(latestRoutineDay(nextState)?.id ?? "");
      setTab("routines");
    },
    [persist, state],
  );

  const updateRoutineExerciseOrder = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        return;
      }

      const dayExercises = state.routineExercises
        .filter((item) => item.routineDayId === selectedDay?.id)
        .sort((a, b) => a.exerciseOrder - b.exerciseOrder);
      const sourceIndex = dayExercises.findIndex(
        (item) => item.id === sourceId,
      );
      const targetIndex = dayExercises.findIndex(
        (item) => item.id === targetId,
      );
      if (sourceIndex < 0 || targetIndex < 0) {
        return;
      }

      const reordered = [...dayExercises];
      const [source] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, source);
      const orderMap = new Map(
        reordered.map((item, index) => [item.id, index + 1]),
      );

      persist({
        ...state,
        routineExercises: state.routineExercises.map((item) =>
          orderMap.has(item.id)
            ? { ...item, exerciseOrder: orderMap.get(item.id)! }
            : item,
        ),
      });
    },
    [persist, selectedDay?.id, state],
  );

  const dropRoutineExercise = useCallback(
    (targetId: string) => {
      updateRoutineExerciseOrder(draggedRoutineExerciseId, targetId);
      setDraggedRoutineExerciseId("");
    },
    [draggedRoutineExerciseId, updateRoutineExerciseOrder],
  );

  const createSupersetWithNext = useCallback(
    (routineExerciseId: string) => {
      const current = state.routineExercises.find(
        (item) => item.id === routineExerciseId,
      );
      if (current?.supersetGroupId) {
        persist({
          ...state,
          routineExercises: state.routineExercises.map((item) =>
            item.supersetGroupId === current.supersetGroupId
              ? { ...item, supersetGroupId: undefined }
              : item,
          ),
          exerciseGroups: state.exerciseGroups.filter(
            (group) => group.id !== current.supersetGroupId,
          ),
        });
        return;
      }

      const ordered = state.routineExercises
        .filter((item) => item.routineDayId === selectedDay?.id)
        .sort((a, b) => a.exerciseOrder - b.exerciseOrder);
      const currentIndex = ordered.findIndex(
        (item) => item.id === routineExerciseId,
      );
      const next = ordered[currentIndex + 1];
      if (!selectedDay || !next) {
        return;
      }

      const groupId = createId("group");
      persist({
        ...state,
        exerciseGroups: [
          ...state.exerciseGroups,
          {
            id: groupId,
            userId: state.userId,
            routineDayId: selectedDay.id,
            groupType: "superset",
            label: `Superset ${state.exerciseGroups.length + 1}`,
          },
        ],
        routineExercises: state.routineExercises.map((item) =>
          item.id === routineExerciseId || item.id === next.id
            ? { ...item, supersetGroupId: groupId }
            : item,
        ),
      });
    },
    [persist, selectedDay, state],
  );

  const deleteRoutineExerciseById = useCallback(
    (routineExerciseId: string) => {
      persist(deleteRoutineExercise(state, routineExerciseId));
    },
    [persist, state],
  );

  const updateRoutineExerciseNotes = useCallback(
    (routineExerciseId: string, notes: string) => {
      persist({
        ...state,
        routineExercises: state.routineExercises.map((item) =>
          item.id === routineExerciseId ? { ...item, notes } : item,
        ),
      });
    },
    [persist, state],
  );

  const updateExerciseRestTargets = useCallback(
    (routineExerciseId: string, restSeconds: string) => {
      const value = Number(restSeconds) || 0;
      persist({
        ...state,
        routineSetTargets: state.routineSetTargets.map((target) =>
          target.routineExerciseId === routineExerciseId
            ? { ...target, restSeconds: value }
            : target,
        ),
      });
    },
    [persist, state],
  );

  const updateTarget = useCallback(
    (
      targetId: string,
      key: "targetWeight" | "targetReps" | "restSeconds",
      value: string,
    ) => {
      persist({
        ...state,
        routineSetTargets: state.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                [key]: key === "restSeconds" ? Number(value) || 0 : value,
              }
            : target,
        ),
      });
    },
    [persist, state],
  );

  const addRoutineSet = useCallback(
    (routineExerciseId: string) => {
      persist(addRoutineSetTarget(state, routineExerciseId));
    },
    [persist, state],
  );

  const addDropTarget = useCallback(
    (targetId: string) => {
      persist({
        ...state,
        routineSetTargets: state.routineSetTargets.map((target) => {
          if (target.id !== targetId) {
            return target;
          }

          return {
            ...target,
            drops: [
              ...(target.drops ?? []),
              {
                id: createId("drop"),
                reps: "8",
                weight: getDefaultDropWeight(target.targetWeight),
              },
            ],
          };
        }),
      });
    },
    [persist, state],
  );

  const updateDropTarget = useCallback(
    (
      targetId: string,
      dropId: string,
      key: "reps" | "weight",
      value: string,
    ) => {
      persist({
        ...state,
        routineSetTargets: state.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                drops: (target.drops ?? []).map((drop) =>
                  drop.id === dropId ? { ...drop, [key]: value } : drop,
                ),
              }
            : target,
        ),
      });
    },
    [persist, state],
  );

  const deleteDropTarget = useCallback(
    (targetId: string, dropId: string) => {
      persist({
        ...state,
        routineSetTargets: state.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                drops: (target.drops ?? []).filter(
                  (drop) => drop.id !== dropId,
                ),
              }
            : target,
        ),
      });
    },
    [persist, state],
  );

  const pauseActiveSession = useCallback(() => {
    if (activeSession) {
      persist(pauseSession(state, activeSession.id));
    }
  }, [activeSession, persist, state]);

  const resumeActiveSession = useCallback(() => {
    if (activeSession) {
      persist(resumeSession(state, activeSession.id));
    }
  }, [activeSession, persist, state]);

  const completeActiveSession = useCallback(
    (routineState?: TrackerState) => {
      if (!activeSession) {
        return;
      }

      const nextState = routineState
        ? mergeRoutineState(state, routineState)
        : state;
      persist(completeSession(nextState, activeSession.id));
      setActiveSessionId("");
      setTab("dashboard");
    },
    [activeSession, persist, state],
  );

  const discardActiveSession = useCallback(() => {
    if (!activeSession) {
      return;
    }

    persist(discardSession(state, activeSession.id));
    setActiveSessionId("");
    setTab("dashboard");
  }, [activeSession, persist, state]);

  const addSetToWorkoutExercise = useCallback(
    (workoutExerciseId: string, values: AddSetValues) => {
      persist(addPerformedSet(state, workoutExerciseId, values));
    },
    [persist, state],
  );

  const deleteSetFromWorkout = useCallback(
    (performedSetId: string) => {
      persist(deletePerformedSet(state, performedSetId));
    },
    [persist, state],
  );

  const toggleExpandedExercise = useCallback((id: string) => {
    setExpandedExerciseId((current) => (current === id ? "" : id));
  }, []);

  const addExerciseToSelectedDay = useCallback(
    (exerciseId: string) => {
      if (!selectedDay) {
        return;
      }

      persist(addExerciseToRoutineDay(state, selectedDay.id, exerciseId));
      setTab("builder");
    },
    [persist, selectedDay, state],
  );

  return {
    activeRoutine,
    activeRoutineTargetsByRoutineExerciseId,
    activeSession,
    activeSessionDayExercises,
    activeSessionDuration,
    activeWorkoutExercises,
    addExerciseToSelectedDay,
    addRoutineSet,
    addSetToWorkoutExercise,
    analytics,
    bodyPart,
    completeActiveSession,
    createRoutine,
    createSupersetWithNext,
    addDropTarget,
    deleteRoutineById,
    deleteDropTarget,
    discardActiveSession,
    deleteSetFromWorkout,
    deleteRoutineExerciseById,
    dropRoutineExercise,
    equipment,
    equipmentOptions,
    exerciseById,
    exerciseQuery,
    expandedExerciseId,
    filteredExercises,
    pauseActiveSession,
    replaceRoutineState,
    resumeActiveSession,
    selectRoutineDay,
    selectedDay,
    selectedDayExercises,
    setBodyPart,
    setDraggedRoutineExerciseId,
    setEquipment,
    setExerciseQuery,
    setTab,
    setsByWorkoutExerciseId,
    startRoutineDay,
    startSelectedDay,
    state,
    tab,
    toggleExpandedExercise,
    updateTarget,
    updateDropTarget,
    updateExerciseRestTargets,
    updateRoutineExerciseNotes,
    duplicateRoutineById,
  };
}

function getDefaultDropWeight(targetWeight?: string) {
  const value = Number.parseFloat(targetWeight ?? "");
  return Number.isFinite(value) ? String(Math.max(0, value - 5)) : "0";
}

function mergeRoutineState(state: TrackerState, routineState: TrackerState) {
  return {
    ...state,
    exerciseGroups: routineState.exerciseGroups,
    routineDays: routineState.routineDays,
    routineExercises: routineState.routineExercises,
    routineSetTargets: routineState.routineSetTargets,
    routines: routineState.routines,
  };
}
