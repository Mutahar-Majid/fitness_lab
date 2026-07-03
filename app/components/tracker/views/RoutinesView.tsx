"use client";

import { useState } from "react";
import { Copy, Pencil, Play, Plus, Trash2 } from "lucide-react";

import type { TrackerState } from "@/lib/domain/types";
import { SectionHeader } from "@/app/components/tracker/ui";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface RoutinesViewProps {
  state: TrackerState;
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  onEditDay: (dayId: string) => void;
  onStartDay: (dayId: string) => void;
  onCreate: () => void;
  onDuplicate: (routineId: string) => void;
  onDelete: (routineId: string) => void;
}

export function RoutinesView({
  state,
  selectedDayId,
  onSelectDay,
  onEditDay,
  onStartDay,
  onCreate,
  onDuplicate,
  onDelete,
}: RoutinesViewProps) {
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const selectedRoutine = state.routines.find(
    (routine) => routine.id === routineToDelete
  );

  return (
    <section className="panel mt-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <SectionHeader eyebrow="Workout" title="Plans and exercises" />
        <Button
          className="h-11 rounded-[13px] border-[var(--rubber)] bg-[var(--rubber)] px-3 text-white shadow-[0_12px_24px_rgba(14,20,19,0.13)] hover:border-[var(--steel-blue)] hover:bg-[var(--steel-blue)] sm:px-4"
          onClick={onCreate}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Create routine</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {state.routines.map((routine) => {
          const days = state.routineDays
            .filter((day) => day.routineId === routine.id)
            .sort((a, b) => a.dayOrder - b.dayOrder);
          const selectedRoutineDay = days.find((day) => day.id === selectedDayId);
          const startDay = selectedRoutineDay ?? days[0];

          return (
            <article
              className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(223,232,223,0.64))] shadow-[0_14px_34px_rgba(14,20,19,0.06)]"
              key={routine.id}
            >
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">{routine.name}</h3>
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
                      className={cn(
                        "rounded-[999px] border px-3 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]",
                        selectedDayId === day.id
                          ? "border-[var(--rubber)] bg-[var(--rubber)] text-white shadow-[0_8px_18px_rgba(14,20,19,0.16)]"
                          : "border-[var(--line)] bg-white/80 text-[var(--muted)] hover:border-[var(--line-strong)] hover:bg-white hover:text-[var(--ink)]",
                      )}
                      key={day.id}
                      onClick={() => onSelectDay(day.id)}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_3rem_3rem_3rem] items-center gap-2 border-t border-[var(--line)] bg-[rgba(255,255,255,0.5)] p-3">
                <Button
                  className="h-12 min-w-0 justify-center rounded-[13px] border-[var(--rubber)] bg-[var(--rubber)] px-3 text-white shadow-[0_10px_22px_rgba(14,20,19,0.14)] hover:border-[var(--steel-blue)] hover:bg-[var(--steel-blue)]"
                  onClick={() => startDay ? onStartDay(startDay.id) : onCreate()}
                  variant="secondary"
                >
                  <Play aria-hidden="true" className="h-4 w-4" />
                  <span className="truncate">Start routine</span>
                </Button>
                <Button
                  aria-label={`Edit ${routine.name}`}
                  className="h-12 w-12 rounded-[13px] border-[var(--line)] bg-white/86 text-[var(--muted)] hover:border-[var(--steel-blue)] hover:bg-white hover:text-[var(--ink)]"
                  onClick={() => startDay ? onEditDay(startDay.id) : onCreate()}
                  size="icon"
                  title="Edit routine"
                  variant="secondary"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  aria-label={`Duplicate ${routine.name}`}
                  className="h-12 w-12 rounded-[13px] border-[var(--line)] bg-white/86 text-[var(--muted)] hover:border-[var(--steel-blue)] hover:bg-white hover:text-[var(--ink)]"
                  onClick={() => onDuplicate(routine.id)}
                  size="icon"
                  title="Duplicate routine"
                  variant="secondary"
                >
                  <Copy aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  aria-label={`Delete ${routine.name}`}
                  className="h-12 w-12 rounded-[13px] border-[color-mix(in_srgb,var(--signal-red)_34%,var(--line))] bg-[color-mix(in_srgb,var(--signal-red)_8%,white)] text-[var(--signal-red)] hover:border-[var(--signal-red)] hover:bg-[var(--signal-red)] hover:text-white"
                  onClick={() => setRoutineToDelete(routine.id)}
                  size="icon"
                  title="Delete routine"
                  variant="secondary"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </Button>
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
