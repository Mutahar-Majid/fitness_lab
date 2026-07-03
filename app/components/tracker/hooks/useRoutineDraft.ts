"use client";

import { useCallback, useMemo, useState } from "react";

import { getRoutineDayExercises } from "@/lib/domain/analytics";
import type { BodyPart, TrackerState } from "@/lib/domain/types";
import {
  addExerciseToRoutineDay,
  addRoutineSetTarget,
  createId,
  deleteRoutineExercise,
} from "@/lib/storage/trackerRepository";

export function useRoutineDraft() {
  const [state, setState] = useState<TrackerState | null>(null);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [draggedRoutineExerciseId, setDraggedRoutineExerciseId] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const selectedDay = useMemo(
    () => state?.routineDays.find((day) => day.id === selectedDayId),
    [selectedDayId, state]
  );
  const dayExercises = useMemo(
    () => (state && selectedDay ? getRoutineDayExercises(state, selectedDay.id) : []),
    [selectedDay, state]
  );
  const filteredExercises = useMemo(() => state?.exercises ?? [], [state]);

  const begin = useCallback((source: TrackerState, dayId: string) => {
    setState(source);
    setSelectedDayId(dayId);
    setHasChanges(false);
  }, []);

  const clear = useCallback(() => {
    setState(null);
    setSelectedDayId("");
    setDraggedRoutineExerciseId("");
    setHasChanges(false);
  }, []);

  const updateDraft = useCallback((getNext: (current: TrackerState) => TrackerState) => {
    setHasChanges(true);
    setState((current) => {
      if (!current) {
        return current;
      }

      return getNext(current);
    });
  }, []);

  const selectDay = useCallback((dayId: string) => {
    setSelectedDayId(dayId);
  }, []);

  const updateRoutineExerciseOrder = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        return;
      }

      updateDraft((current) => {
        const dayExercisesForOrder = current.routineExercises
          .filter((item) => item.routineDayId === selectedDayId)
          .sort((a, b) => a.exerciseOrder - b.exerciseOrder);
        const sourceIndex = dayExercisesForOrder.findIndex(
          (item) => item.id === sourceId
        );
        const targetIndex = dayExercisesForOrder.findIndex(
          (item) => item.id === targetId
        );
        if (sourceIndex < 0 || targetIndex < 0) {
          return current;
        }

        const reordered = [...dayExercisesForOrder];
        const [source] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, source);
        const orderMap = new Map(
          reordered.map((item, index) => [item.id, index + 1])
        );

        return {
          ...current,
          routineExercises: current.routineExercises.map((item) =>
            orderMap.has(item.id)
              ? { ...item, exerciseOrder: orderMap.get(item.id)! }
              : item
          ),
        };
      });
    },
    [selectedDayId, updateDraft]
  );

  const dropRoutineExercise = useCallback(
    (targetId: string) => {
      updateRoutineExerciseOrder(draggedRoutineExerciseId, targetId);
      setDraggedRoutineExerciseId("");
    },
    [draggedRoutineExerciseId, updateRoutineExerciseOrder]
  );

  const createSupersetWithNext = useCallback(
    (routineExerciseId: string) => {
      updateDraft((current) => {
        const routineExercise = current.routineExercises.find(
          (item) => item.id === routineExerciseId
        );
        if (routineExercise?.supersetGroupId) {
          return {
            ...current,
            routineExercises: current.routineExercises.map((item) =>
              item.supersetGroupId === routineExercise.supersetGroupId
                ? { ...item, supersetGroupId: undefined }
                : item
            ),
            exerciseGroups: current.exerciseGroups.filter(
              (group) => group.id !== routineExercise.supersetGroupId
            ),
          };
        }

        const ordered = current.routineExercises
          .filter((item) => item.routineDayId === selectedDayId)
          .sort((a, b) => a.exerciseOrder - b.exerciseOrder);
        const currentIndex = ordered.findIndex((item) => item.id === routineExerciseId);
        const next = ordered[currentIndex + 1];
        if (!next) {
          return current;
        }

        const groupId = createId("group");
        return {
          ...current,
          exerciseGroups: [
            ...current.exerciseGroups,
            {
              id: groupId,
              userId: current.userId,
              routineDayId: selectedDayId,
              groupType: "superset",
              label: `Superset ${current.exerciseGroups.length + 1}`,
            },
          ],
          routineExercises: current.routineExercises.map((item) =>
            item.id === routineExerciseId || item.id === next.id
              ? { ...item, supersetGroupId: groupId }
              : item
          ),
        };
      });
    },
    [selectedDayId, updateDraft]
  );

  const deleteRoutineExerciseById = useCallback(
    (routineExerciseId: string) => {
      updateDraft((current) => deleteRoutineExercise(current, routineExerciseId));
    },
    [updateDraft]
  );

  const updateRoutineExerciseNotes = useCallback(
    (routineExerciseId: string, notes: string) => {
      updateDraft((current) => ({
        ...current,
        routineExercises: current.routineExercises.map((item) =>
          item.id === routineExerciseId ? { ...item, notes } : item
        ),
      }));
    },
    [updateDraft]
  );

  const updateExerciseRestTargets = useCallback(
    (routineExerciseId: string, restSeconds: string) => {
      const value = Number(restSeconds) || 0;
      updateDraft((current) => ({
        ...current,
        routineSetTargets: current.routineSetTargets.map((target) =>
          target.routineExerciseId === routineExerciseId
            ? { ...target, restSeconds: value }
            : target
        ),
      }));
    },
    [updateDraft]
  );

  const updateTarget = useCallback(
    (
      targetId: string,
      key: "targetWeight" | "targetReps" | "restSeconds",
      value: string
    ) => {
      updateDraft((current) => ({
        ...current,
        routineSetTargets: current.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                [key]: key === "restSeconds" ? Number(value) || 0 : value,
              }
            : target
        ),
      }));
    },
    [updateDraft]
  );

  const addRoutineSet = useCallback(
    (routineExerciseId: string) => {
      updateDraft((current) => addRoutineSetTarget(current, routineExerciseId));
    },
    [updateDraft]
  );

  const addDropTarget = useCallback(
    (targetId: string) => {
      updateDraft((current) => ({
        ...current,
        routineSetTargets: current.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                drops: [
                  ...(target.drops ?? []),
                  {
                    id: createId("drop"),
                    reps: "8",
                    weight: getDefaultDropWeight(target.targetWeight),
                  },
                ],
              }
            : target
        ),
      }));
    },
    [updateDraft]
  );

  const updateDropTarget = useCallback(
    (targetId: string, dropId: string, key: "reps" | "weight", value: string) => {
      updateDraft((current) => ({
        ...current,
        routineSetTargets: current.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                drops: (target.drops ?? []).map((drop) =>
                  drop.id === dropId ? { ...drop, [key]: value } : drop
                ),
              }
            : target
        ),
      }));
    },
    [updateDraft]
  );

  const deleteDropTarget = useCallback(
    (targetId: string, dropId: string) => {
      updateDraft((current) => ({
        ...current,
        routineSetTargets: current.routineSetTargets.map((target) =>
          target.id === targetId
            ? {
                ...target,
                drops: (target.drops ?? []).filter((drop) => drop.id !== dropId),
              }
            : target
        ),
      }));
    },
    [updateDraft]
  );

  const addExerciseToSelectedDay = useCallback(
    (exerciseId: string) => {
      if (!selectedDay) {
        return;
      }

      updateDraft((current) =>
        addExerciseToRoutineDay(current, selectedDay.id, exerciseId)
      );
    },
    [selectedDay, updateDraft]
  );

  const filterDraftExercises = useCallback(
    (query: string, bodyPart: "all" | BodyPart, equipment: string) => {
      const normalized = query.trim().toLowerCase();
      return filteredExercises.filter((exercise) => {
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
    },
    [filteredExercises]
  );

  const markSaved = useCallback(() => setHasChanges(false), []);

  return {
    addDropTarget,
    addExerciseToSelectedDay,
    addRoutineSet,
    begin,
    clear,
    createSupersetWithNext,
    dayExercises,
    deleteDropTarget,
    deleteRoutineExerciseById,
    dropRoutineExercise,
    filterDraftExercises,
    hasChanges,
    markSaved,
    selectDay,
    selectedDay,
    setDraggedRoutineExerciseId,
    state,
    updateDropTarget,
    updateExerciseRestTargets,
    updateRoutineExerciseNotes,
    updateTarget,
  };
}

function getDefaultDropWeight(targetWeight?: string) {
  const value = Number.parseFloat(targetWeight ?? "");
  return Number.isFinite(value) ? String(Math.max(0, value - 5)) : "0";
}
