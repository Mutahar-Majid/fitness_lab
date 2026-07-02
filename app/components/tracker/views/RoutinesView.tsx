"use client";

import { useState } from "react";
import { Copy, LibraryBig, Pencil, Plus, Trash2 } from "lucide-react";

import type { TrackerState } from "@/lib/domain/types";
import { PrimaryButton, SecondaryButton, SectionHeader } from "@/app/components/tracker/ui";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoutinesViewProps {
  state: TrackerState;
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  onCreate: () => void;
  onDuplicate: (routineId: string) => void;
  onDelete: (routineId: string) => void;
  onOpenBuilder: () => void;
  onOpenLibrary: () => void;
}

export function RoutinesView({
  state,
  selectedDayId,
  onSelectDay,
  onCreate,
  onDuplicate,
  onDelete,
  onOpenBuilder,
  onOpenLibrary,
}: RoutinesViewProps) {
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const selectedRoutine = state.routines.find(
    (routine) => routine.id === routineToDelete
  );

  return (
    <section className="panel mt-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <SectionHeader eyebrow="Workout" title="Plans and exercises" />
        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[33rem]">
          <PrimaryButton onClick={onCreate}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Create routine
          </PrimaryButton>
          <SecondaryButton onClick={onOpenBuilder}>
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Open builder
          </SecondaryButton>
          <SecondaryButton onClick={onOpenLibrary}>
            <LibraryBig aria-hidden="true" className="h-4 w-4" />
            Exercise library
          </SecondaryButton>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {state.routines.map((routine) => {
          const days = state.routineDays
            .filter((day) => day.routineId === routine.id)
            .sort((a, b) => a.dayOrder - b.dayOrder);
          return (
            <article
              className="rounded-[18px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(223,232,223,0.62))] p-4 shadow-[0_14px_34px_rgba(14,20,19,0.06)]"
              key={routine.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{routine.name}</h3>
                  <p className="text-sm text-stone-600">
                    {routine.trainingDays} training days ·{" "}
                    {routine.archived ? "archived" : "active"}
                  </p>
                </div>
                <Badge>{days.length} days</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    className={`rounded-[12px] border px-3 py-2 text-sm font-black transition ${selectedDayId === day.id
                        ? "border-[var(--rubber)] bg-[var(--rubber)] text-white"
                        : "border-[var(--line)] bg-white/80 text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                      }`}
                    key={day.id}
                    onClick={() => onSelectDay(day.id)}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:flex">
                <SecondaryButton onClick={() => onDuplicate(routine.id)}>
                  <Copy aria-hidden="true" className="h-4 w-4" />
                  Duplicate
                </SecondaryButton>
                <SecondaryButton onClick={() => setRoutineToDelete(routine.id)}>
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete
                </SecondaryButton>
              </div>
            </article>
          );
        })}
      </div>
      <Dialog
        open={Boolean(routineToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRoutineToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <p className="eyebrow">Delete routine</p>
            <DialogTitle>Remove this workout?</DialogTitle>
            <DialogDescription>
              {selectedRoutine?.name ?? "This routine"} and its planned days,
              exercises, and targets will be removed from the planner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="primary-button border-[var(--signal-red)] bg-[var(--signal-red)] hover:border-[var(--ink)] hover:bg-[var(--ink)]"
              onClick={() => {
                if (routineToDelete) {
                  onDelete(routineToDelete);
                }
                setRoutineToDelete(null);
              }}
            >
              Delete routine
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
