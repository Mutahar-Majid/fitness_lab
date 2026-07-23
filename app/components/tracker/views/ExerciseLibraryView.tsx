"use client";

import { useState } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import {
  bodyPartLabels,
  bodyPartOrder,
} from "@/lib/domain/analytics";
import type { BodyPart, Exercise, RoutineDay } from "@/lib/domain/types";
import { ExerciseDemoMedia } from "@/app/components/tracker/components/ExerciseDemoMedia";
import { ExerciseStillImage } from "@/app/components/tracker/components/ExerciseStillImage";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/app/components/tracker/ui";
import { cn } from "@/lib/utils";

interface ExerciseLibraryViewProps {
  query: string;
  bodyPart: "all" | BodyPart;
  equipment: string;
  equipmentOptions: string[];
  exercises: Exercise[];
  expandedExerciseId: string;
  selectedDay?: RoutineDay;
  onQuery: (value: string) => void;
  onBodyPart: (value: "all" | BodyPart) => void;
  onEquipment: (value: string) => void;
  onExpand: (id: string) => void;
  onAdd: (ids: string[]) => void;
}

export function ExerciseLibraryView({
  query,
  bodyPart,
  equipment,
  equipmentOptions,
  exercises,
  expandedExerciseId,
  selectedDay,
  onQuery,
  onBodyPart,
  onEquipment,
  onExpand,
  onAdd,
}: ExerciseLibraryViewProps) {
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(
    () => new Set()
  );
  const selectedExercise = exercises.find(
    (exercise) => exercise.id === expandedExerciseId
  );
  const selectedCount = selectedExerciseIds.size;

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((current) => {
      const next = new Set(current);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const addSelectedExercises = () => {
    if (selectedExerciseIds.size === 0) {
      return;
    }

    onAdd(Array.from(selectedExerciseIds));
    setSelectedExerciseIds(new Set());
  };

  if (selectedExercise) {
    return (
      <>
        <ExerciseLibraryDetail
          exercise={selectedExercise}
          isSelected={selectedExerciseIds.has(selectedExercise.id)}
          selectedDay={selectedDay}
          onBack={() => onExpand(selectedExercise.id)}
          onToggle={() => toggleExercise(selectedExercise.id)}
        />
        <ExerciseSelectionCta
          count={selectedCount}
          onAdd={addSelectedExercises}
        />
      </>
    );
  }

  return (
    <>
      <section className="panel mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader eyebrow="Exercise library" title="Strength movements" />
          <span className="badge">{exercises.length} matches</span>
        </div>
        <div className="mt-5 grid gap-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <input
            className="field"
            placeholder="Search name, alias, muscle, equipment"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
          <select
            className="field"
            value={bodyPart}
            onChange={(event) =>
              onBodyPart(event.target.value as "all" | BodyPart)
            }
          >
            <option value="all">All body parts</option>
            {bodyPartOrder.map((part) => (
              <option key={part} value={part}>
                {bodyPartLabels[part]}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={equipment}
            onChange={(event) => onEquipment(event.target.value)}
          >
            <option value="all">All equipment</option>
            {equipmentOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {exercises.map((exercise) => {
            const isSelected = selectedExerciseIds.has(exercise.id);

            return (
              <article
                className={cn(
                  "list-card rounded-[18px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(223,232,223,0.66))] p-3 shadow-[0_14px_34px_rgba(14,20,19,0.06)] transition sm:p-4",
                  isSelected &&
                  "border-[var(--steel-blue)] shadow-[0_14px_34px_rgba(63,88,115,0.14)]"
                )}
                key={exercise.id}
              >
                <div className="grid grid-cols-[3rem_minmax(0,1fr)_2.75rem] items-start gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_2.75rem] sm:gap-4">
                  <button
                    aria-label={`Open ${exercise.name} details and demonstration`}
                    className="group relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white text-left shadow-[0_8px_20px_rgba(14,20,19,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(14,20,19,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)] sm:aspect-square sm:h-auto sm:w-auto sm:rounded-[14px] sm:border sm:border-[var(--line)] sm:shadow-[inset_0_-10px_30px_rgba(14,20,19,0.04)]"
                    onClick={() => onExpand(exercise.id)}
                    type="button"
                  >
                    <ExerciseStillImage
                      alt={`${exercise.name} preview`}
                      className="transition duration-200 group-hover:scale-[1.03]"
                      src={exercise.gifUrl}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-2 hidden rounded-full bg-[rgba(14,20,19,0.76)] px-2.5 py-1 font-mono text-[0.62rem] font-black uppercase text-white sm:block">
                      View demo
                    </span>
                  </button>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight">{exercise.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-stone-600 sm:hidden">
                      {exercise.bodyParts
                        .map((part) => bodyPartLabels[part])
                        .join(", ")}
                    </p>
                    <p className="hidden text-sm text-stone-600 sm:block">
                      {exercise.targetMuscles.join(", ")} ·{" "}
                      {exercise.equipment.join(", ")}
                    </p>
                    <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
                      {exercise.bodyParts.map((part) => (
                        <span className="badge" key={part}>
                          {bodyPartLabels[part]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    aria-label={`${isSelected ? "Remove" : "Add"
                      } ${exercise.name} ${isSelected ? "from" : "to"
                      } selection`}
                    aria-pressed={isSelected}
                    className={cn(
                      "h-11 w-11 rounded-full",
                      isSelected &&
                      "border-[var(--plate-yellow)] bg-[var(--plate-yellow)] text-[var(--ink)] hover:border-[var(--plate-yellow)] hover:bg-[var(--plate-yellow)]"
                    )}
                    disabled={!selectedDay}
                    onClick={() => toggleExercise(exercise.id)}
                    size="icon"
                    type="button"
                    variant={isSelected ? "default" : "secondary"}
                  >
                    {isSelected ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Plus aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-xs text-stone-500">
          Exercise metadata and GIFs are sourced from{" "}
          <a
            className="font-semibold underline decoration-stone-300 underline-offset-4"
            href="https://ascendapi.com"
            rel="noreferrer"
            target="_blank"
          >
            AscendAPI ExerciseDB
          </a>
          . OSS data is for non-commercial prototypes, personal projects, and
          educational use.
        </p>
      </section>
      <ExerciseSelectionCta
        count={selectedCount}
        onAdd={addSelectedExercises}
      />
    </>
  );
}

interface ExerciseLibraryDetailProps {
  exercise: Exercise;
  isSelected: boolean;
  selectedDay?: RoutineDay;
  onBack: () => void;
  onToggle: () => void;
}

function ExerciseLibraryDetail({
  exercise,
  isSelected,
  selectedDay,
  onBack,
  onToggle,
}: ExerciseLibraryDetailProps) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="panel overflow-hidden">
        <button
          className="secondary-button mb-4 inline-flex h-10 items-center gap-2 rounded-[12px] px-3"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Library
        </button>
        <ExerciseDemoMedia
          className="aspect-[4/3] rounded-[18px]"
          exercise={exercise}
        />
        <Button
          aria-pressed={isSelected}
          className="mt-4 w-full"
          disabled={!selectedDay}
          onClick={onToggle}
          variant={isSelected ? "secondary" : "default"}
        >
          {isSelected ? (
            <Check aria-hidden="true" />
          ) : (
            <Plus aria-hidden="true" />
          )}
          {isSelected ? "Selected" : "Select exercise"}
        </Button>
      </aside>

      <div className="panel">
        <SectionHeader eyebrow="Exercise profile" title={exercise.name} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <DetailMetric
            label="Targets"
            value={exercise.targetMuscles.join(", ") || "Not tagged"}
          />
          <DetailMetric
            label="Body parts"
            value={
              exercise.bodyParts.map((part) => bodyPartLabels[part]).join(", ") ||
              "Not tagged"
            }
          />
          <DetailMetric
            label="Equipment"
            value={exercise.equipment.join(", ") || "Not tagged"}
          />
        </div>
        <div className="mt-4 rounded-[16px] border border-[var(--line)] bg-white/76 p-4">
          <p className="font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
            Instructions
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-semibold text-stone-700">
            {exercise.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ExerciseSelectionCta({
  count,
  onAdd,
}: {
  count: number;
  onAdd: () => void;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-24 z-50 flex justify-center md:bottom-6">
      <Button
        className="pointer-events-auto h-14 w-full max-w-sm rounded-[16px] px-6 text-base shadow-[0_18px_50px_rgba(8,12,12,0.34)]"
        onClick={onAdd}
      >
        Add {count} {count === 1 ? "exercise" : "exercises"}
      </Button>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-white/76 p-4">
      <p className="font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-[var(--ink)]">{value}</p>
    </div>
  );
}
