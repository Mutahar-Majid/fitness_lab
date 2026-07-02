import Image from "next/image";
import {
  bodyPartLabels,
  bodyPartOrder,
} from "@/lib/domain/analytics";
import type { BodyPart, Exercise, RoutineDay } from "@/lib/domain/types";
import {
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/app/components/tracker/ui";

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
  onAdd: (id: string) => void;
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
  return (
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
          onChange={(event) => onBodyPart(event.target.value as "all" | BodyPart)}
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
          const expanded = expandedExerciseId === exercise.id;
          return (
            <article
              className="list-card rounded-[18px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(223,232,223,0.66))] p-4 shadow-[0_14px_34px_rgba(14,20,19,0.06)]"
              key={exercise.id}
            >
              <div className="flex gap-3">
                <button
                  className="h-16 w-16 shrink-0 rounded-[14px] bg-[var(--plate-yellow)] text-xs font-black text-[var(--ink)] shadow-[inset_0_-7px_0_rgba(0,0,0,0.12)]"
                  onClick={() => onExpand(exercise.id)}
                >
                  GIF
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{exercise.name}</h3>
                  <p className="text-sm text-stone-600">
                    {exercise.targetMuscles.join(", ")} ·{" "}
                    {exercise.equipment.join(", ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exercise.bodyParts.map((part) => (
                      <span className="badge" key={part}>
                        {bodyPartLabels[part]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {expanded ? (
                <div className="mt-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface-panel)] p-3">
                  <Image
                    alt={`${exercise.name} demo`}
                    className="h-44 w-full rounded-lg object-cover"
                    height={176}
                    loading="lazy"
                    src={exercise.gifUrl}
                    unoptimized
                    width={480}
                  />
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-stone-700">
                    {exercise.instructions.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <div className="mt-4 grid gap-2 sm:flex">
                <SecondaryButton onClick={() => onExpand(exercise.id)}>
                  {expanded ? "Collapse" : "Expand"}
                </SecondaryButton>
                <PrimaryButton
                  disabled={!selectedDay}
                  onClick={() => onAdd(exercise.id)}
                >
                  Add to routine
                </PrimaryButton>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
