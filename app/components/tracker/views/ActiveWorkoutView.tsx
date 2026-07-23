"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { setVolume } from "@/lib/domain/analytics";
import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import type {
  RoutineDropTarget,
  RoutineSetTarget,
  TrackerState,
  WorkoutExercise,
  WorkoutSession,
} from "@/lib/domain/types";
import type {
  AddSetValues,
  PerformedSetsByWorkoutExerciseId,
} from "@/app/components/tracker/types";
import { emptySets, formatDuration } from "@/app/components/tracker/utils";
import { PrimaryButton } from "@/app/components/tracker/ui";
import { RoutineBuilderExerciseDetail } from "@/app/components/tracker/views/RoutineBuilderExerciseDetail";
import { RoutineBuilderExerciseList } from "@/app/components/tracker/views/RoutineBuilderExerciseList";
import { RoutineBuilderReorderScreen } from "@/app/components/tracker/views/RoutineBuilderReorderScreen";
import type {
  SetCompletionControls,
  SetCompletionToggle,
} from "@/app/components/tracker/views/RoutineBuilderSetTable";

type DayExercise = ReturnType<typeof getRoutineDayExercises>[number];
type PerformedSet = TrackerState["performedSets"][number];

interface ActiveWorkoutViewProps {
  activeSession?: WorkoutSession;
  activeSessionDuration: number;
  dayExercises: ReturnType<typeof getRoutineDayExercises>;
  openMenuId: string;
  routineState: TrackerState;
  selectedDayName: string;
  setsByWorkoutExerciseId: PerformedSetsByWorkoutExerciseId;
  workoutExercises: WorkoutExercise[];
  onAddDrop: (targetId: string) => void;
  onAddSet: (workoutExerciseId: string, values: AddSetValues) => void;
  onAddTargetSet: (routineExerciseId: string) => void;
  onComplete: () => void;
  onDiscard: () => void;
  onDeleteDrop: (targetId: string, dropId: string) => void;
  onDeleteExercise: (routineExerciseId: string) => void;
  onDeleteSet: (performedSetId: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string) => void;
  onDropChange: (
    targetId: string,
    dropId: string,
    key: "reps" | "weight",
    value: string
  ) => void;
  onMenu: (id: string) => void;
  onNotesChange: (routineExerciseId: string, notes: string) => void;
  onRestChange: (routineExerciseId: string, restSeconds: string) => void;
  onSuperset: (id: string) => void;
  onTargetChange: (
    targetId: string,
    key: "targetWeight" | "targetReps" | "restSeconds",
    value: string
  ) => void;
}

export function ActiveWorkoutView({
  activeSession,
  activeSessionDuration,
  dayExercises,
  openMenuId,
  routineState,
  selectedDayName,
  setsByWorkoutExerciseId,
  workoutExercises,
  onAddDrop,
  onAddSet,
  onAddTargetSet,
  onComplete,
  onDiscard,
  onDeleteDrop,
  onDeleteExercise,
  onDeleteSet,
  onDragStart,
  onDrop,
  onDropChange,
  onMenu,
  onNotesChange,
  onRestChange,
  onSuperset,
  onTargetChange,
}: ActiveWorkoutViewProps) {
  const [mode, setMode] = useState<"log" | "reorder">("log");
  const [detailExercise, setDetailExercise] = useState<DayExercise | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const startRestTimer = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    setShowRestTimer(true);
  }, []);
  const sessionSets = workoutExercises.flatMap(
    (workoutExercise) =>
      setsByWorkoutExerciseId.get(workoutExercise.id) ?? emptySets
  );
  const sessionVolume = sessionSets.reduce(
    (total, set) => total + setVolume(set),
    0
  );
  const completionByRoutineExerciseId = useCompletionControls({
    setsByWorkoutExerciseId,
    workoutExercises,
    onAddSet,
    onDeleteSet,
    onRestStart: startRestTimer,
  });

  useEffect(() => {
    if (!showRestTimer || restSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setRestSeconds((seconds) => Math.max(0, seconds - 1)),
      1000
    );

    return () => window.clearTimeout(timer);
  }, [restSeconds, showRestTimer]);

  if (!activeSession) {
    return null;
  }

  if (mode === "reorder") {
    return (
      <RoutineBuilderReorderScreen
        dayExercises={dayExercises}
        onBack={() => setMode("log")}
        onDragStart={onDragStart}
        onDrop={onDrop}
        selectedDayName={selectedDayName}
      />
    );
  }

  if (detailExercise) {
    return (
      <RoutineBuilderExerciseDetail
        dayExercise={detailExercise}
        state={routineState}
        onBack={() => setDetailExercise(null)}
      />
    );
  }

  return (
    <section className="mt-4 grid gap-4">
      <div className="panel grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.72fr)_auto] items-stretch gap-1 p-1.5 sm:gap-2 sm:p-3">
        <SessionMetric
          label="Duration"
          value={formatDuration(activeSessionDuration)}
        />
        <SessionMetric label="Vol (kg)" value={String(sessionVolume)} />
        <SessionMetric label="Sets" value={String(sessionSets.length)} />
        <PrimaryButton
          className="h-full min-h-0 shrink-0 px-2 py-1.5 text-[0.68rem] sm:px-4 sm:py-2 sm:text-sm"
          onClick={onComplete}
        >
          Finish
        </PrimaryButton>
      </div>

      <RoutineBuilderExerciseList
        dayExercises={dayExercises}
        notesCollapsedByDefault
        openMenuId={openMenuId}
        setCompletionByRoutineExerciseId={completionByRoutineExerciseId}
        onAddDrop={onAddDrop}
        onAddSet={onAddTargetSet}
        onDeleteDrop={onDeleteDrop}
        onDropChange={onDropChange}
        onMenu={onMenu}
        onNotesChange={onNotesChange}
        onOpenDelete={(item) => onDeleteExercise(item.routineExercise.id)}
        onOpenDetail={setDetailExercise}
        onOpenReorder={() => setMode("reorder")}
        onRestChange={onRestChange}
        onSuperset={onSuperset}
        onTargetChange={onTargetChange}
      />

      <button
        className="mb-3 min-h-12 rounded-[12px] border border-[var(--signal-red)] bg-[rgba(196,76,63,0.08)] px-4 text-sm font-black text-[var(--signal-red)] transition hover:bg-[var(--signal-red)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-red)]"
        onClick={onDiscard}
      >
        Discard workout
      </button>

      {showRestTimer ? (
        <RestTimerDock
          seconds={restSeconds}
          onAdd={() => setRestSeconds((seconds) => seconds + 15)}
          onSubtract={() =>
            setRestSeconds((seconds) => Math.max(0, seconds - 15))
          }
          onSkip={() => {
            setRestSeconds(0);
            setShowRestTimer(false);
          }}
        />
      ) : null}
    </section>
  );
}

function SessionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[var(--line)] bg-white/80 px-1.5 py-1 sm:rounded-[10px] sm:px-2 sm:py-1.5">
      <p className="truncate font-mono text-[0.46rem] font-black uppercase text-[var(--muted)] sm:text-[0.58rem]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-black leading-none text-[var(--ink)] sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function useCompletionControls({
  setsByWorkoutExerciseId,
  workoutExercises,
  onAddSet,
  onDeleteSet,
  onRestStart,
}: {
  setsByWorkoutExerciseId: PerformedSetsByWorkoutExerciseId;
  workoutExercises: WorkoutExercise[];
  onAddSet: (workoutExerciseId: string, values: AddSetValues) => void;
  onDeleteSet: (performedSetId: string) => void;
  onRestStart: (seconds: number) => void;
}) {
  return useMemo(() => {
    const completion = new Map<string, SetCompletionControls>();

    for (const workoutExercise of workoutExercises) {
      if (!workoutExercise.routineExerciseId) {
        continue;
      }

      completion.set(workoutExercise.routineExerciseId, {
        completedSets:
          setsByWorkoutExerciseId.get(workoutExercise.id) ?? emptySets,
        onToggle: (toggle) =>
          toggleCompletion({
            toggle,
            workoutExerciseId: workoutExercise.id,
            onAddSet,
            onDeleteSet,
            onRestStart,
          }),
      });
    }

    return completion;
  }, [onAddSet, onDeleteSet, onRestStart, setsByWorkoutExerciseId, workoutExercises]);
}

function toggleCompletion({
  toggle,
  workoutExerciseId,
  onAddSet,
  onDeleteSet,
  onRestStart,
}: {
  toggle: SetCompletionToggle;
  workoutExerciseId: string;
  onAddSet: (workoutExerciseId: string, values: AddSetValues) => void;
  onDeleteSet: (performedSetId: string) => void;
  onRestStart: (seconds: number) => void;
}) {
  if (!toggle.checked) {
    if (toggle.completedSet) {
      onDeleteSet(toggle.completedSet.id);
    }
    return;
  }

  if (toggle.drop && !toggle.parentSet) {
    return;
  }

  onAddSet(
    workoutExerciseId,
    getAddSetValues({
      drop: toggle.drop,
      dropIndex: toggle.dropIndex,
      parentSet: toggle.parentSet,
      target: toggle.target,
    })
  );
  onRestStart(Math.max(0, toggle.target.restSeconds));
}

function getAddSetValues({
  drop,
  dropIndex,
  parentSet,
  target,
}: {
  drop?: RoutineDropTarget;
  dropIndex?: number;
  parentSet?: PerformedSet;
  target: RoutineSetTarget;
}): AddSetValues {
  return {
    weight: parseDecimal(drop?.weight ?? target.targetWeight),
    reps: parseInteger(drop?.reps ?? target.targetReps),
    setType: drop ? "drop" : "normal",
    isFailure: false,
    setNumber: target.setNumber,
    dropIndex,
    parentSetId: parentSet?.id,
  };
}

function parseDecimal(value?: string) {
  const number = Number.parseFloat(value ?? "");
  return Number.isFinite(number) ? number : 0;
}

function parseInteger(value?: string) {
  const number = Number.parseInt(value ?? "", 10);
  return Number.isFinite(number) ? number : 0;
}

function RestTimerDock({
  seconds,
  onAdd,
  onSkip,
  onSubtract,
}: {
  seconds: number;
  onAdd: () => void;
  onSkip: () => void;
  onSubtract: () => void;
}) {
  return (
    <div className="fixed inset-x-3 bottom-24 z-50 md:bottom-6">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-[14px] border border-white/10 bg-[rgba(12,17,17,0.94)] p-2 text-white shadow-[0_18px_54px_rgba(5,9,9,0.34)] backdrop-blur-xl">
        <div className="min-w-0 px-2">
          <p className="font-mono text-[0.58rem] font-black uppercase text-[var(--plate-yellow)]">
            Rest
          </p>
          <p className="text-xl font-black leading-none">
            {formatDuration(seconds)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            className="min-h-10 rounded-[9px] bg-white/10 px-3 text-xs font-black transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]"
            onClick={onAdd}
          >
            +15
          </button>
          <button
            className="min-h-10 rounded-[9px] bg-white/10 px-3 text-xs font-black transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]"
            onClick={onSubtract}
          >
            -15
          </button>
          <button
            className="min-h-10 rounded-[9px] bg-white px-3 text-xs font-black text-[var(--ink)] transition hover:bg-[var(--plate-yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
