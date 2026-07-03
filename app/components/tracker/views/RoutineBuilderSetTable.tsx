import { Check, Plus, Timer, X } from "lucide-react";
import type { ReactNode } from "react";

import type { RoutineDropTarget, RoutineSetTarget, TrackerState } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PerformedSet = TrackerState["performedSets"][number];

export interface SetCompletionToggle {
  checked: boolean;
  completedSet?: PerformedSet;
  drop?: RoutineDropTarget;
  dropIndex?: number;
  parentSet?: PerformedSet;
  target: RoutineSetTarget;
}

export interface SetCompletionControls {
  completedSets: TrackerState["performedSets"];
  onToggle: (toggle: SetCompletionToggle) => void;
}

interface RoutineBuilderSetTableProps {
  completion?: SetCompletionControls;
  routineExerciseId: string;
  targets: RoutineSetTarget[];
  onAddDrop: (targetId: string) => void;
  onAddSet: (routineExerciseId: string) => void;
  onDeleteDrop: (targetId: string, dropId: string) => void;
  onDropChange: (
    targetId: string,
    dropId: string,
    key: "reps" | "weight",
    value: string
  ) => void;
  onTargetChange: (
    targetId: string,
    key: "targetWeight" | "targetReps" | "restSeconds",
    value: string
  ) => void;
}

export function RoutineBuilderSetTable({
  completion,
  routineExerciseId,
  targets,
  onAddDrop,
  onAddSet,
  onDeleteDrop,
  onDropChange,
  onTargetChange,
}: RoutineBuilderSetTableProps) {
  const gridClass = getSetTableGridClass(Boolean(completion));

  return (
    <div className="mt-4 overflow-hidden rounded-[14px] border border-[var(--line)] bg-white/76">
      <div
        className={cn(
          "grid gap-2 border-b border-[var(--line)] bg-[var(--surface-rail)] px-3 py-2 font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]",
          gridClass
        )}
      >
        <span>Set</span>
        <span>Kg</span>
        <span>Reps</span>
        <span />
        {completion ? <span className="text-right">Done</span> : null}
      </div>

      <div className="divide-y divide-[var(--line)]">
        {targets.map((target) => (
          <SetGroup
            completion={completion}
            key={target.id}
            target={target}
            onAddDrop={onAddDrop}
            onDeleteDrop={onDeleteDrop}
            onDropChange={onDropChange}
            onTargetChange={onTargetChange}
          />
        ))}
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-black text-[var(--steel-blue)] transition hover:bg-[var(--surface-rail)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--steel-blue)]"
        onClick={() => onAddSet(routineExerciseId)}
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        Add set
      </button>
    </div>
  );
}

function SetGroup({
  completion,
  target,
  onAddDrop,
  onDeleteDrop,
  onDropChange,
  onTargetChange,
}: Omit<RoutineBuilderSetTableProps, "routineExerciseId" | "targets" | "onAddSet"> & {
  target: RoutineSetTarget;
}) {
  const mainSet = completion
    ? findMainSet(completion.completedSets, target.setNumber)
    : undefined;

  return (
    <div>
      <EditableSetRow
        hasCompletion={Boolean(completion)}
        label={`Set ${target.setNumber}`}
        reps={target.targetReps}
        weight={target.targetWeight ?? ""}
        action={
          <Button
            aria-label={`Add drop to set ${target.setNumber}`}
            className="h-9 w-9 rounded-full text-[var(--steel-blue)]"
            onClick={() => onAddDrop(target.id)}
            size="icon"
            variant="secondary"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </Button>
        }
        done={
          completion ? (
            <DoneControl
              checked={Boolean(mainSet)}
              label={`Mark set ${target.setNumber} complete`}
              onChange={(checked) =>
                completion.onToggle({
                  checked,
                  completedSet: mainSet,
                  target,
                })
              }
            />
          ) : null
        }
        onReps={(value) => onTargetChange(target.id, "targetReps", value)}
        onWeight={(value) => onTargetChange(target.id, "targetWeight", value)}
      />

      {(target.drops ?? []).map((drop, index) => {
        const dropIndex = index + 1;
        const dropSet =
          completion && mainSet
            ? findDropSet(completion.completedSets, mainSet.id, dropIndex)
            : undefined;

        return (
          <EditableSetRow
            isDrop
            hasCompletion={Boolean(completion)}
            key={drop.id}
            label={`Drop ${dropIndex}`}
            reps={drop.reps}
            weight={drop.weight}
            action={
              <Button
                aria-label={`Remove drop ${dropIndex}`}
                className="h-8 w-8 rounded-full text-[var(--signal-red)]"
                onClick={() => onDeleteDrop(target.id, drop.id)}
                size="icon"
                variant="secondary"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            }
            done={
              completion ? (
                <DoneControl
                  checked={Boolean(dropSet)}
                  disabled={!mainSet && !dropSet}
                  label={`Mark drop ${dropIndex} complete`}
                  onChange={(checked) =>
                    completion.onToggle({
                      checked,
                      completedSet: dropSet,
                      drop,
                      dropIndex,
                      parentSet: mainSet,
                      target,
                    })
                  }
                />
              ) : null
            }
            onReps={(value) => onDropChange(target.id, drop.id, "reps", value)}
            onWeight={(value) => onDropChange(target.id, drop.id, "weight", value)}
          />
        );
      })}
    </div>
  );
}

function EditableSetRow({
  action,
  done,
  hasCompletion,
  isDrop,
  label,
  meta,
  reps,
  weight,
  onReps,
  onWeight,
}: {
  action?: ReactNode;
  done?: ReactNode;
  hasCompletion?: boolean;
  isDrop?: boolean;
  label: string;
  meta?: string;
  reps: string;
  weight: string;
  onReps: (value: string) => void;
  onWeight: (value: string) => void;
}) {
  const gridClass = getSetTableGridClass(Boolean(hasCompletion));

  return (
    <div
      className={cn(
        "grid items-center gap-2 px-3",
        gridClass,
        isDrop ? "bg-[#f2edff]/80 py-2" : "py-3"
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-black text-[var(--ink)]">{label}</span>
        {meta ? (
          <span className="mt-0.5 block font-mono text-[0.58rem] font-black uppercase text-[#745bd6]">
            {meta}
          </span>
        ) : null}
      </span>
      <input
        aria-label={`${label}${meta ? ` ${meta}` : ""} kg`}
        className="min-h-10 min-w-0 rounded-[10px] border border-[var(--line)] bg-white px-3 text-sm font-black outline-none transition focus:border-[var(--steel-blue)] focus:ring-2 focus:ring-[rgba(61,103,128,0.16)]"
        inputMode="decimal"
        placeholder="0"
        value={weight}
        onChange={(event) => onWeight(event.target.value)}
      />
      <input
        aria-label={`${label}${meta ? ` ${meta}` : ""} reps`}
        className="min-h-10 min-w-0 rounded-[10px] border border-[var(--line)] bg-white px-3 text-sm font-black outline-none transition focus:border-[var(--steel-blue)] focus:ring-2 focus:ring-[rgba(61,103,128,0.16)]"
        inputMode="numeric"
        placeholder="8"
        value={reps}
        onChange={(event) => onReps(event.target.value)}
      />
      <span className="flex justify-end">{action}</span>
      {hasCompletion ? <span className="flex justify-end">{done}</span> : null}
    </div>
  );
}

function DoneControl({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex justify-end">
      <input
        aria-label={label}
        checked={checked}
        className="peer sr-only"
        disabled={disabled}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[rgba(99,112,106,0.34)] bg-[rgba(99,112,106,0.12)] text-[rgba(99,112,106,0.56)] transition peer-checked:border-[var(--success)] peer-checked:bg-[var(--success)] peer-checked:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-45 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--steel-blue)]">
        <Check aria-hidden="true" className="h-4 w-4" />
      </span>
    </label>
  );
}

function getSetTableGridClass(hasCompletion: boolean) {
  return hasCompletion
    ? "grid-cols-[3.35rem_minmax(0,1fr)_minmax(0,1fr)_2.45rem_2.55rem] sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_3rem_3.2rem]"
    : "grid-cols-[3.8rem_minmax(0,1fr)_minmax(0,1fr)_2.7rem] sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_3rem]";
}

function findMainSet(sets: PerformedSet[], setNumber: number) {
  return sets.find((set) => !set.parentSetId && set.setNumber === setNumber);
}

function findDropSet(sets: PerformedSet[], parentSetId: string, dropIndex: number) {
  return sets.find(
    (set) => set.parentSetId === parentSetId && set.dropIndex === dropIndex
  );
}

export function RestTimerControl({
  restSeconds,
  routineExerciseId,
  onRestChange,
}: {
  restSeconds: number;
  routineExerciseId: string;
  onRestChange: (routineExerciseId: string, restSeconds: string) => void;
}) {
  const minutes = Math.floor(restSeconds / 60);
  const seconds = restSeconds % 60;
  const secondOptions = minutes === 5 ? [0] : restSecondOptions;
  const updateRest = (nextMinutes: number, nextSeconds: number) => {
    const clampedSeconds = nextMinutes === 5 ? 0 : nextSeconds;
    onRestChange(routineExerciseId, String(nextMinutes * 60 + clampedSeconds));
  };

  return (
    <label className="grid min-w-44 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[12px] border border-[var(--line)] bg-white/80 px-2 py-1.5">
      <Timer aria-hidden="true" className="h-4 w-4 text-[var(--steel-blue)]" />
      <span className="grid gap-0.5">
        <span className="font-mono text-[0.58rem] font-black uppercase text-[var(--muted)]">
          Rest
        </span>
        <span className="grid grid-cols-2 gap-1">
          <select
            aria-label="Rest minutes"
            className="min-w-0 bg-transparent text-sm font-black outline-none"
            value={minutes}
            onChange={(event) => updateRest(Number(event.target.value), seconds)}
          >
            {restMinuteOptions.map((option) => (
              <option key={option} value={option}>
                {option === 0 && seconds === 0 ? "Off" : `${option}min`}
              </option>
            ))}
          </select>
          <select
            aria-label="Rest seconds"
            className="min-w-0 bg-transparent text-sm font-black outline-none"
            value={minutes === 5 ? 0 : seconds}
            onChange={(event) => updateRest(minutes, Number(event.target.value))}
          >
            {secondOptions.map((option) => (
              <option key={option} value={option}>
                {option}s
              </option>
            ))}
          </select>
        </span>
      </span>
    </label>
  );
}

const restMinuteOptions = [0, 1, 2, 3, 4, 5];
const restSecondOptions = Array.from({ length: 12 }, (_, index) => index * 5);
