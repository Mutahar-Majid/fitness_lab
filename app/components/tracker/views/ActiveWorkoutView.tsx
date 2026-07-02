"use client";

import { useEffect, useState } from "react";
import {
  estimatedOneRepMax,
  setVolume,
} from "@/lib/domain/analytics";
import type {
  Exercise,
  SetType,
  TrackerState,
  WorkoutExercise,
  WorkoutSession,
} from "@/lib/domain/types";
import { restPresets } from "@/app/components/tracker/constants";
import type {
  AddSetValues,
  PerformedSetsByWorkoutExerciseId,
} from "@/app/components/tracker/types";
import { emptySets, formatDuration } from "@/app/components/tracker/utils";
import {
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/app/components/tracker/ui";

interface ActiveWorkoutViewProps {
  activeSession?: WorkoutSession;
  activeSessionDuration: number;
  workoutExercises: WorkoutExercise[];
  exerciseById: Map<string, Exercise>;
  setsByWorkoutExerciseId: PerformedSetsByWorkoutExerciseId;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onAddSet: (workoutExerciseId: string, values: AddSetValues) => void;
}

export function ActiveWorkoutView({
  activeSession,
  activeSessionDuration,
  workoutExercises,
  exerciseById,
  setsByWorkoutExerciseId,
  onStart,
  onPause,
  onResume,
  onComplete,
  onAddSet,
}: ActiveWorkoutViewProps) {
  const [restSeconds, setRestSeconds] = useState(0);

  useEffect(() => {
    if (restSeconds <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setRestSeconds(restSeconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [restSeconds]);

  if (!activeSession) {
    return (
      <section className="panel text-center">
        <SectionHeader eyebrow="Active workout" title="No workout running" />
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600">
          Start the selected routine day to log sets, dropsets, supersets,
          previous performance, rest time, and duration.
        </p>
        <PrimaryButton className="mt-5" onClick={onStart}>
          Start routine
        </PrimaryButton>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr]">
      <aside className="panel h-fit lg:sticky lg:top-24">
        <SectionHeader eyebrow="Session timer" title="Live set log" />
        <h2 className="mt-3 text-5xl font-black">
          {formatDuration(activeSessionDuration)}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Paused time excluded: {formatDuration(activeSession.totalPausedSeconds)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {activeSession.status === "paused" ? (
            <PrimaryButton onClick={onResume}>Resume</PrimaryButton>
          ) : (
            <SecondaryButton onClick={onPause}>Pause</SecondaryButton>
          )}
          <PrimaryButton onClick={onComplete}>Stop</PrimaryButton>
        </div>
        <div className="mt-5 rounded-lg bg-[var(--surface-rail)] p-4">
          <p className="text-sm font-semibold text-stone-600">Rest timer</p>
          <div className="mt-1 text-3xl font-black">
            {formatDuration(restSeconds)}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {restPresets.map((seconds) => (
              <button
                className="rounded-md bg-[var(--surface-panel)] px-2 py-3 text-sm font-bold transition hover:bg-white"
                key={seconds}
                onClick={() => setRestSeconds(seconds)}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      </aside>
      <div className="grid gap-4">
        {workoutExercises.map((workoutExercise) => {
          const exercise = exerciseById.get(workoutExercise.exerciseId);
          if (!exercise) {
            return null;
          }
          return (
            <WorkoutExerciseCard
              exercise={exercise}
              key={workoutExercise.id}
              sets={setsByWorkoutExerciseId.get(workoutExercise.id) ?? emptySets}
              workoutExercise={workoutExercise}
              onAddSet={(values) => {
                onAddSet(workoutExercise.id, values);
                setRestSeconds(values.setType === "warmup" ? 60 : 120);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

interface WorkoutExerciseCardProps {
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
  sets: TrackerState["performedSets"];
  onAddSet: (values: AddSetValues) => void;
}

function WorkoutExerciseCard({
  exercise,
  workoutExercise,
  sets,
  onAddSet,
}: WorkoutExerciseCardProps) {
  const lastSet = sets.findLast((set) => set.setType !== "skipped");
  const [weight, setWeight] = useState(lastSet?.weight ?? 0);
  const [reps, setReps] = useState(lastSet?.reps ?? 8);
  const [setType, setSetType] = useState<SetType>("normal");
  const [isFailure, setIsFailure] = useState(false);
  const [parentSetId, setParentSetId] = useState("");

  const add = () => {
    onAddSet({
      weight,
      reps,
      setType,
      isFailure,
      parentSetId: setType === "drop" ? parentSetId || lastSet?.id : undefined,
    });
    setSetType("normal");
    setIsFailure(false);
    setParentSetId("");
  };

  return (
    <article className="panel mt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{exercise.name}</h3>
          <p className="text-sm text-stone-600">
            Previous shortcut:{" "}
            {lastSet ? `${lastSet.weight} kg x ${lastSet.reps}` : "none yet"}
            {workoutExercise.supersetGroupId ? " · superset" : ""}
          </p>
        </div>
        <span className="badge">
          e1RM {lastSet ? estimatedOneRepMax(lastSet.weight, lastSet.reps) : 0}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase text-stone-500">
            <tr>
              <th className="py-2">Set</th>
              <th>Weight</th>
              <th>Reps</th>
              <th>Type</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {sets.map((set) => (
              <tr className="border-t border-stone-200" key={set.id}>
                <td className="py-2 font-bold">
                  {set.setNumber}
                  {set.dropIndex ? `.${set.dropIndex}` : ""}
                </td>
                <td>{set.weight} kg</td>
                <td>{set.reps}</td>
                <td>{set.isFailure ? `${set.setType} failure` : set.setType}</td>
                <td>{setVolume(set)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lastSet ? (
        <SecondaryButton
          className="mt-4"
          onClick={() => {
            setWeight(lastSet.weight);
            setReps(lastSet.reps);
          }}
        >
          Copy previous set
        </SecondaryButton>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
        <input
          className="field"
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(Number(event.target.value))}
        />
        <input
          className="field"
          inputMode="numeric"
          value={reps}
          onChange={(event) => setReps(Number(event.target.value))}
        />
        <select
          className="field"
          value={setType}
          onChange={(event) => setSetType(event.target.value as SetType)}
        >
          <option value="normal">Normal</option>
          <option value="warmup">Warm-up</option>
          <option value="drop">Dropset</option>
          <option value="backoff">Backoff</option>
          <option value="skipped">Skipped</option>
        </select>
        <PrimaryButton onClick={add}>Add set</PrimaryButton>
      </div>
      {setType === "drop" ? (
        <select
          className="field mt-2 w-full"
          value={parentSetId}
          onChange={(event) => setParentSetId(event.target.value)}
        >
          <option value="">Attach to latest set</option>
          {sets
            .filter((set) => !set.parentSetId)
            .map((set) => (
              <option key={set.id} value={set.id}>
                Main set {set.setNumber}: {set.weight} kg x {set.reps}
              </option>
            ))}
        </select>
      ) : null}
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
        <input
          checked={isFailure}
          onChange={(event) => setIsFailure(event.target.checked)}
          type="checkbox"
        />
        Mark as failure
      </label>
    </article>
  );
}
