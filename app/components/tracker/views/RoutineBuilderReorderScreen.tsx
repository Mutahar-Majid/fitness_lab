import { ArrowLeft, GripVertical } from "lucide-react";

import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/app/components/tracker/ui";

type DayExercise = ReturnType<typeof getRoutineDayExercises>[number];

interface ReorderScreenProps {
  dayExercises: DayExercise[];
  onBack: () => void;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string) => void;
  selectedDayName: string;
}

export function RoutineBuilderReorderScreen({
  dayExercises,
  onBack,
  onDragStart,
  onDrop,
  selectedDayName,
}: ReorderScreenProps) {
  return (
    <section className="panel mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button
            className="mb-4 h-10 rounded-[12px]"
            onClick={onBack}
            size="sm"
            variant="secondary"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back
          </Button>
          <SectionHeader eyebrow="Reorder" title={selectedDayName} />
        </div>
        <Badge variant="steel">Drag rows</Badge>
      </div>
      <div className="mt-5 grid gap-2">
        {dayExercises.map(({ routineExercise, exercise }) => (
          <article
            className="grid cursor-grab grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3 rounded-[14px] border border-[var(--line)] bg-white/82 p-3 active:cursor-grabbing"
            draggable
            key={routineExercise.id}
            onDragStart={() => onDragStart(routineExercise.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(routineExercise.id)}
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black">{exercise.name}</h3>
              <p className="text-xs font-bold text-[var(--muted)]">
                Position {routineExercise.exerciseOrder}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-[var(--line)] bg-[var(--surface-rail)] text-[var(--muted)]">
              <GripVertical aria-hidden="true" className="h-4 w-4" />
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
