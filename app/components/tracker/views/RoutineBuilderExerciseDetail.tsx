/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Award, Dumbbell, Target } from "lucide-react";

import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import {
  bodyPartLabels,
  estimatedOneRepMax,
  setVolume,
} from "@/lib/domain/analytics";
import type { PerformedSet, TrackerState } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { LineTrendChart } from "@/app/components/tracker/components/LineTrendChart";
import { SectionHeader } from "@/app/components/tracker/ui";
import { cn } from "@/lib/utils";

type DayExercise = ReturnType<typeof getRoutineDayExercises>[number];
type GraphMetric = "heaviest" | "oneRm" | "volume";

interface RoutineBuilderExerciseDetailProps {
  dayExercise: DayExercise;
  state: TrackerState;
  onBack: () => void;
}

export function RoutineBuilderExerciseDetail({
  dayExercise,
  state,
  onBack,
}: RoutineBuilderExerciseDetailProps) {
  const [metric, setMetric] = useState<GraphMetric>("heaviest");
  const stats = useMemo(
    () => buildExerciseStats(state, dayExercise.exercise.id),
    [dayExercise.exercise.id, state]
  );
  const chartPoints = stats.graph.map((point) => ({
    label: point.label,
    value: point[metric],
  }));

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[0.86fr_1.25fr]">
      <aside className="panel overflow-hidden">
        <Button
          aria-label="Back to exercise"
          className="mb-4 h-10 rounded-[12px]"
          onClick={onBack}
          size="sm"
          variant="secondary"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Exercise
        </Button>

        <div className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-white">
          <img
            alt=""
            className="aspect-[4/3] w-full object-cover"
            src={dayExercise.exercise.gifUrl}
          />
        </div>

        <div className="mt-4">
          <SectionHeader
            eyebrow="Exercise profile"
            title={dayExercise.exercise.name}
          />
          <div className="mt-4 grid gap-2">
            <MuscleRow
              icon={Dumbbell}
              label="Targets"
              value={dayExercise.exercise.targetMuscles.join(", ") || "Not tagged"}
            />
            <MuscleRow
              icon={Target}
              label="Primary"
              value={
                dayExercise.exercise.bodyParts
                  .map((part) => bodyPartLabels[part])
                  .join(", ") || "Not tagged"
              }
            />
            <MuscleRow
              icon={Award}
              label="Secondary"
              value={
                dayExercise.exercise.secondaryMuscles.join(", ") || "None logged"
              }
            />
          </div>
        </div>
      </aside>

      <div className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeader eyebrow="Last 3 months" title="Weight trend" />
          <div className="grid grid-cols-3 rounded-[12px] border border-[var(--line)] bg-white/70 p-1">
            {graphTabs.map((tab) => (
              <button
                className={cn(
                  "rounded-[9px] px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]",
                  metric === tab.id
                    ? "bg-[var(--rubber)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                )}
                key={tab.id}
                onClick={() => setMetric(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border border-[var(--line)] bg-white/76 p-4">
          {stats.hasRecent ? (
            <LineTrendChart points={chartPoints} tone="lavender" />
          ) : (
            <div className="grid min-h-56 place-items-center rounded-[14px] bg-[var(--surface-rail)] p-6 text-center">
              <p className="max-w-xs text-sm font-semibold text-[var(--muted)]">
                Log this movement in a workout to build a 3-month trend.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PrMetric label="Heaviest weight" value={`${stats.prs.heaviest} kg`} />
          <PrMetric label="One rep max" value={`${stats.prs.oneRm} kg`} />
          <PrMetric label="Best set volume" value={`${stats.prs.volume} kg`} />
        </div>
      </div>
    </section>
  );
}

function MuscleRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 rounded-[14px] border border-[var(--line)] bg-white/72 p-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-rail)] text-[var(--steel-blue)]">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <span>
        <span className="block font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
          {label}
        </span>
        <span className="mt-1 block text-sm font-black text-[var(--ink)]">
          {value}
        </span>
      </span>
    </div>
  );
}

function PrMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-white/76 p-4">
      <p className="font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[var(--ink)]">{value}</p>
    </div>
  );
}

const graphTabs: Array<{ id: GraphMetric; label: string }> = [
  { id: "heaviest", label: "Heaviest" },
  { id: "oneRm", label: "1RM" },
  { id: "volume", label: "Volume" },
];

function buildExerciseStats(state: TrackerState, exerciseId: string) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  const recentSets = state.performedSets.filter(
    (set) =>
      set.exerciseId === exerciseId &&
      !set.isWarmup &&
      set.setType !== "skipped" &&
      new Date(set.completedAt) >= cutoff
  );

  return {
    hasRecent: recentSets.length > 0,
    graph: buildMonthlyPoints(recentSets),
    prs: {
      heaviest: round(maxBy(recentSets, (set) => set.weight)),
      oneRm: round(maxBy(recentSets, (set) => estimatedOneRepMax(set.weight, set.reps))),
      volume: round(maxBy(recentSets, setVolume)),
    },
  };
}

function buildMonthlyPoints(sets: PerformedSet[]) {
  const labels = Array.from({ length: 12 }, (_, offset) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - offset));
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en", { month: "short" }),
    };
  }).slice(-3);

  return labels.map(({ key, label }) => {
    const monthSets = sets.filter((set) => {
      const date = new Date(set.completedAt);
      return key === `${date.getFullYear()}-${date.getMonth()}`;
    });

    return {
      label,
      heaviest: round(maxBy(monthSets, (set) => set.weight)),
      oneRm: round(maxBy(monthSets, (set) => estimatedOneRepMax(set.weight, set.reps))),
      volume: round(maxBy(monthSets, setVolume)),
    };
  });
}

function maxBy(sets: PerformedSet[], getValue: (set: PerformedSet) => number) {
  return sets.reduce((best, set) => Math.max(best, getValue(set)), 0);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
