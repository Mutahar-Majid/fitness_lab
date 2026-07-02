import { GripVertical } from "lucide-react";

import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import type { RoutineDay, TrackerState } from "@/lib/domain/types";
import { PrimaryButton, SecondaryButton, SectionHeader } from "@/app/components/tracker/ui";
import { Badge } from "@/components/ui/badge";

interface RoutineBuilderViewProps {
  state: TrackerState;
  selectedDay: RoutineDay;
  dayExercises: ReturnType<typeof getRoutineDayExercises>;
  onSelectDay: (dayId: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string) => void;
  onSuperset: (id: string) => void;
  onTargetChange: (
    targetId: string,
    key: "targetReps" | "restSeconds",
    value: string
  ) => void;
  onOpenLibrary: () => void;
}

export function RoutineBuilderView({
  state,
  selectedDay,
  dayExercises,
  onSelectDay,
  onDragStart,
  onDrop,
  onSuperset,
  onTargetChange,
  onOpenLibrary,
}: RoutineBuilderViewProps) {
  const routine = state.routines.find((item) => item.id === selectedDay.routineId);
  const days = state.routineDays
    .filter((day) => day.routineId === selectedDay.routineId)
    .sort((a, b) => a.dayOrder - b.dayOrder);

  return (
    <section className="grid gap-4 lg:grid-cols-[0.72fr_1.45fr] mt-4">
      <aside className="panel">
        <SectionHeader
          eyebrow="Routine builder"
          title={routine?.name ?? "Untitled routine"}
        />
        <div className="mt-4 grid gap-2">
          {days.map((day) => (
            <button
              className={`rounded-[12px] px-3 py-3 text-left text-sm font-black transition ${day.id === selectedDay.id
                  ? "bg-[var(--rubber)] text-white"
                  : "bg-[var(--surface-rail)] text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
                }`}
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

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader eyebrow="Edit day" title={selectedDay.name} />
          <Badge variant="steel">Drag to order</Badge>
        </div>
        <div className="mt-5 grid gap-3">
          {dayExercises.map(({ routineExercise, exercise, targets, group }) => (
            <article
              className="rounded-[16px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(223,232,223,0.62))] p-3 shadow-[0_12px_34px_rgba(14,20,19,0.06)] sm:p-4"
              draggable
              key={routineExercise.id}
              onDragStart={() => onDragStart(routineExercise.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(routineExercise.id)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <GripVertical
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[var(--muted)]"
                    />
                    <h3 className="font-bold">{exercise.name}</h3>
                  </div>
                  <p className="text-sm text-stone-600">
                    {exercise.targetMuscles.join(", ")} ·{" "}
                    {exercise.equipment.join(", ")}
                  </p>
                  {group ? (
                    <p className="mt-1 text-sm font-semibold text-sky-700">
                      {group}
                    </p>
                  ) : null}
                </div>
                <SecondaryButton
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => onSuperset(routineExercise.id)}
                >
                  Superset next
                </SecondaryButton>
              </div>
              <div className="mt-4 grid gap-2">
                {targets.map((target) => (
                  <div
                    className="grid gap-2 rounded-[12px] border border-[var(--line)] bg-white/72 p-2 sm:grid-cols-[54px_minmax(0,1fr)_minmax(0,1fr)] sm:items-center"
                    key={target.id}
                  >
                    <span className="rounded-[10px] bg-[var(--rubber)] px-3 py-2 text-center text-sm font-black text-white">
                      Set {target.setNumber}
                    </span>
                    <label className="grid gap-1">
                      <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
                        Reps
                      </span>
                      <input
                        className="field min-w-0"
                        value={target.targetReps}
                        onChange={(event) =>
                          onTargetChange(target.id, "targetReps", event.target.value)
                        }
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
                        Rest
                      </span>
                      <input
                        className="field min-w-0"
                        inputMode="numeric"
                        value={target.restSeconds}
                        onChange={(event) =>
                          onTargetChange(target.id, "restSeconds", event.target.value)
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-stone-600">
                {routineExercise.progressionNotes}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
