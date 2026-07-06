"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Save,
} from "lucide-react";

import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import type { RoutineDay, TrackerState } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { EditableNameDialog } from "@/app/components/tracker/components/EditableNameDialog";
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
import { PrimaryButton } from "@/app/components/tracker/ui";
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
  onAddDay: (routineId: string) => void;
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
  onRenameDay: (dayId: string, name: string) => void;
  onRenameRoutine: (routineId: string, name: string) => void;
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
  onAddDay,
  onAddSet,
  onBack,
  onDeleteDrop,
  onDeleteExercise,
  onDropChange,
  onNotesChange,
  onOpenLibrary,
  onRestChange,
  onRenameDay,
  onRenameRoutine,
  onSave,
}: RoutineBuilderViewProps) {
  const [mode, setMode] = useState<"edit" | "reorder">("edit");
  const [openMenuId, setOpenMenuId] = useState("");
  const [detailExercise, setDetailExercise] = useState<DayExercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<DayExercise | null>(null);
  const [routineToRename, setRoutineToRename] = useState(false);
  const [dayToRename, setDayToRename] = useState<RoutineDay | null>(null);
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
        <EditableHeader
          eyebrow="Routine builder"
          title={routine?.name ?? "Untitled routine"}
          onRename={routine ? () => setRoutineToRename(true) : undefined}
        />
        <div className="mt-4 grid gap-2">
          {days.map((day) => (
            <div
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_2.25rem] items-center rounded-[12px] transition",
                day.id === selectedDay.id
                  ? "bg-[var(--rubber)] text-white"
                  : "bg-[var(--surface-rail)] text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]",
              )}
              key={day.id}
            >
              <button
                className="min-w-0 truncate px-3 py-3 text-left text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]"
                onClick={() => onSelectDay(day.id)}
              >
                {day.name}
              </button>
              <Button
                aria-label={`Rename ${day.name}`}
                className={cn(
                  "mr-1 h-8 w-8 rounded-[10px]",
                  day.id === selectedDay.id
                    ? "text-white hover:bg-white/14 hover:text-white"
                    : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
                onClick={() => setDayToRename(day)}
                size="icon"
                title="Rename day"
                variant="ghost"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {routine ? (
          <Button
            className="mt-3 h-10 w-full rounded-[12px]"
            onClick={() => onAddDay(routine.id)}
            variant="secondary"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add day
          </Button>
        ) : null}
        <PrimaryButton className="mt-5 w-full" onClick={onOpenLibrary}>
          Add exercise
        </PrimaryButton>
      </aside>

      <div className="panel overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EditableHeader
            eyebrow="Edit day"
            title={selectedDay.name}
            onRename={() => setDayToRename(selectedDay)}
          />
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
      {routine ? (
        <EditableNameDialog
          description="Give this routine a clear name before saving it to your planner."
          inputLabel="Routine name"
          key={`${routine.id}-${routine.name}-${routineToRename ? "open" : "closed"}`}
          open={routineToRename}
          title="Rename routine"
          value={routine.name}
          onOpenChange={setRoutineToRename}
          onSave={(name) => onRenameRoutine(routine.id, name)}
        />
      ) : null}
      {dayToRename ? (
        <EditableNameDialog
          description="Name this training day for the split, focus, or schedule you use."
          inputLabel="Day name"
          key={dayToRename.id}
          open={Boolean(dayToRename)}
          title="Rename day"
          value={dayToRename.name}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setDayToRename(null);
            }
          }}
          onSave={(name) => onRenameDay(dayToRename.id, name)}
        />
      ) : null}
    </section>
  );
}

function EditableHeader({
  eyebrow,
  title,
  onRename,
}: {
  eyebrow: string;
  title: string;
  onRename?: () => void;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="section-title truncate">{title}</h2>
        {onRename ? (
          <Button
            aria-label={`Rename ${title}`}
            className="h-8 w-8 shrink-0 rounded-[10px] text-[var(--muted)] hover:text-[var(--ink)]"
            onClick={onRename}
            size="icon"
            title="Rename"
            variant="ghost"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
