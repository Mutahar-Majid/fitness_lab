"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
} from "lucide-react";

import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import type { RoutineDay, TrackerState } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoutineBuilderExerciseList } from "@/app/components/tracker/views/RoutineBuilderExerciseList";
import { RoutineBuilderExerciseDetail } from "@/app/components/tracker/views/RoutineBuilderExerciseDetail";
import { RoutineBuilderReorderScreen } from "@/app/components/tracker/views/RoutineBuilderReorderScreen";
import { PrimaryButton, SectionHeader } from "@/app/components/tracker/ui";
import { cn } from "@/lib/utils";

type DayExercise = ReturnType<typeof getRoutineDayExercises>[number];

interface RoutineBuilderViewProps {
  state: TrackerState;
  selectedDay: RoutineDay;
  dayExercises: ReturnType<typeof getRoutineDayExercises>;
  hasChanges: boolean;
  onSelectDay: (dayId: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string) => void;
  onSuperset: (id: string) => void;
  onTargetChange: (
    targetId: string,
    key: "targetWeight" | "targetReps" | "restSeconds",
    value: string
  ) => void;
  onAddDrop: (targetId: string) => void;
  onAddSet: (routineExerciseId: string) => void;
  onBack: () => void;
  onDeleteDrop: (targetId: string, dropId: string) => void;
  onDeleteExercise: (routineExerciseId: string) => void;
  onDropChange: (
    targetId: string,
    dropId: string,
    key: "reps" | "weight",
    value: string
  ) => void;
  onNotesChange: (routineExerciseId: string, notes: string) => void;
  onOpenLibrary: () => void;
  onRestChange: (routineExerciseId: string, restSeconds: string) => void;
  onSave: () => void;
}

export function RoutineBuilderView({
  state,
  selectedDay,
  dayExercises,
  hasChanges,
  onSelectDay,
  onDragStart,
  onDrop,
  onSuperset,
  onTargetChange,
  onAddDrop,
  onAddSet,
  onBack,
  onDeleteDrop,
  onDeleteExercise,
  onDropChange,
  onNotesChange,
  onOpenLibrary,
  onRestChange,
  onSave,
}: RoutineBuilderViewProps) {
  const [mode, setMode] = useState<"edit" | "reorder">("edit");
  const [openMenuId, setOpenMenuId] = useState("");
  const [detailExercise, setDetailExercise] = useState<DayExercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<DayExercise | null>(null);
  const routine = state.routines.find((item) => item.id === selectedDay.routineId);
  const days = state.routineDays
    .filter((day) => day.routineId === selectedDay.routineId)
    .sort((a, b) => a.dayOrder - b.dayOrder);

  if (mode === "reorder") {
    return (
      <RoutineBuilderReorderScreen
        dayExercises={dayExercises}
        onBack={() => setMode("edit")}
        onDragStart={onDragStart}
        onDrop={onDrop}
        selectedDayName={selectedDay.name}
      />
    );
  }

  if (detailExercise) {
    return (
      <RoutineBuilderExerciseDetail
        dayExercise={detailExercise}
        state={state}
        onBack={() => setDetailExercise(null)}
      />
    );
  }

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_1.45fr]">
      <aside className="panel">
        <Button
          aria-label="Back to workout"
          className="mb-4 h-10 rounded-[12px]"
          onClick={onBack}
          size="sm"
          variant="secondary"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Workout
        </Button>
        <SectionHeader
          eyebrow="Routine builder"
          title={routine?.name ?? "Untitled routine"}
        />
        <div className="mt-4 grid gap-2">
          {days.map((day) => (
            <button
              className={cn(
                "rounded-[12px] px-3 py-3 text-left text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]",
                day.id === selectedDay.id
                  ? "bg-[var(--rubber)] text-white"
                  : "bg-[var(--surface-rail)] text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]",
              )}
              key={day.id}
              onClick={() => onSelectDay(day.id)}
            >
              {day.name}
            </button>
          ))}
        </div>
        <PrimaryButton className="mt-5 w-full" onClick={onOpenLibrary}>
          Add exercise
        </PrimaryButton>
      </aside>

      <div className="panel overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader eyebrow="Edit day" title={selectedDay.name} />
          <Button
            className="h-10 rounded-[12px]"
            disabled={!hasChanges}
            onClick={onSave}
            size="sm"
            variant="default"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            Save changes
          </Button>
        </div>
        <RoutineBuilderExerciseList
          dayExercises={dayExercises}
          onAddDrop={onAddDrop}
          onAddSet={onAddSet}
          onDeleteDrop={onDeleteDrop}
          onDropChange={onDropChange}
          onMenu={(id) => setOpenMenuId(openMenuId === id ? "" : id)}
          onNotesChange={onNotesChange}
          onOpenDelete={setExerciseToDelete}
          onOpenDetail={setDetailExercise}
          onOpenReorder={() => setMode("reorder")}
          onRestChange={onRestChange}
          onSuperset={onSuperset}
          onTargetChange={onTargetChange}
          openMenuId={openMenuId}
        />
      </div>

      <Dialog
        open={Boolean(exerciseToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setExerciseToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <p className="eyebrow">Delete exercise</p>
            <DialogTitle>Remove from this day?</DialogTitle>
            <DialogDescription>
              {exerciseToDelete?.exercise.name ?? "This exercise"} and its
              planned sets will be removed from {selectedDay.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="primary-button border-[var(--signal-red)] bg-[var(--signal-red)] hover:border-[var(--ink)] hover:bg-[var(--ink)]"
              onClick={() => {
                if (exerciseToDelete) {
                  onDeleteExercise(exerciseToDelete.routineExercise.id);
                }
                setExerciseToDelete(null);
              }}
            >
              Delete exercise
            </button>
            <DialogClose asChild>
              <button className="secondary-button">Cancel</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
