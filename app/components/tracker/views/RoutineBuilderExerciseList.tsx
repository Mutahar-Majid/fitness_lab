/* eslint-disable @next/next/no-img-element */
import {
  Check,
  Link2,
  MoreHorizontal,
  Shuffle,
  StickyNote,
  Trash2,
} from "lucide-react";

import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import type { Exercise, RoutineExercise } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import {
  RestTimerControl,
  RoutineBuilderSetTable,
  type SetCompletionControls,
} from "@/app/components/tracker/views/RoutineBuilderSetTable";
import { cn } from "@/lib/utils";

type DayExercise = ReturnType<typeof getRoutineDayExercises>[number];

export interface RoutineBuilderExerciseListProps {
  dayExercises: DayExercise[];
  openMenuId: string;
  setCompletionByRoutineExerciseId?: Map<string, SetCompletionControls>;
  onAddDrop: (targetId: string) => void;
  onAddSet: (routineExerciseId: string) => void;
  onDeleteDrop: (targetId: string, dropId: string) => void;
  onDropChange: (
    targetId: string,
    dropId: string,
    key: "reps" | "weight",
    value: string
  ) => void;
  onMenu: (id: string) => void;
  onNotesChange: (routineExerciseId: string, notes: string) => void;
  onOpenDelete: (item: DayExercise) => void;
  onOpenDetail: (item: DayExercise) => void;
  onOpenReorder: () => void;
  onRestChange: (routineExerciseId: string, restSeconds: string) => void;
  onSuperset: (id: string) => void;
  onTargetChange: (
    targetId: string,
    key: "targetWeight" | "targetReps" | "restSeconds",
    value: string
  ) => void;
}

export function RoutineBuilderExerciseList({
  dayExercises,
  openMenuId,
  setCompletionByRoutineExerciseId,
  onAddDrop,
  onAddSet,
  onDeleteDrop,
  onDropChange,
  onMenu,
  onNotesChange,
  onOpenDelete,
  onOpenDetail,
  onOpenReorder,
  onRestChange,
  onSuperset,
  onTargetChange,
}: RoutineBuilderExerciseListProps) {
  return (
    <div className="mt-5 grid gap-3">
      {buildExerciseBlocks(dayExercises).map((block) =>
        block.kind === "superset" ? (
          <SupersetBlock
            block={block}
            key={block.group}
            onAddDrop={onAddDrop}
            onAddSet={onAddSet}
            onDeleteDrop={onDeleteDrop}
            onDropChange={onDropChange}
            onMenu={onMenu}
            onNotesChange={onNotesChange}
            onOpenDelete={onOpenDelete}
            onOpenDetail={onOpenDetail}
            onOpenReorder={onOpenReorder}
            onRestChange={onRestChange}
            onSuperset={onSuperset}
            onTargetChange={onTargetChange}
            openMenuId={openMenuId}
            setCompletionByRoutineExerciseId={setCompletionByRoutineExerciseId}
          />
        ) : (
          <ExerciseCard
            dayExercise={block.item}
            key={block.item.routineExercise.id}
            onAddDrop={onAddDrop}
            onAddSet={onAddSet}
            onDeleteDrop={onDeleteDrop}
            onDropChange={onDropChange}
            onMenu={onMenu}
            onNotesChange={onNotesChange}
            onOpenDelete={onOpenDelete}
            onOpenDetail={onOpenDetail}
            onOpenReorder={onOpenReorder}
            onRestChange={onRestChange}
            onSuperset={onSuperset}
            onTargetChange={onTargetChange}
            openMenuId={openMenuId}
            setCompletionByRoutineExerciseId={setCompletionByRoutineExerciseId}
            showRestTimer
          />
        ),
      )}
    </div>
  );
}

interface SupersetBlockProps
  extends Omit<RoutineBuilderExerciseListProps, "dayExercises"> {
  block: { kind: "superset"; group: string; items: DayExercise[] };
}

function SupersetBlock({
  block,
  openMenuId,
  setCompletionByRoutineExerciseId,
  onAddDrop,
  onAddSet,
  onDeleteDrop,
  onDropChange,
  onMenu,
  onNotesChange,
  onOpenDelete,
  onOpenDetail,
  onOpenReorder,
  onRestChange,
  onSuperset,
  onTargetChange,
}: SupersetBlockProps) {
  const first = block.items[0];
  return (
    <div className="rounded-[18px] border-2 border-[#bda7ff] bg-[#f2edff] p-2 shadow-[0_16px_36px_rgba(83,60,143,0.1)]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2 pt-1">
        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-[999px] bg-white/80 px-3 py-1.5 text-xs font-black text-[#5d46a0] transition hover:bg-white focus-within:ring-2 focus-within:ring-[#745bd6]"
        >
          <input
            checked
            className="sr-only"
            type="checkbox"
            onChange={() => first && onSuperset(first.routineExercise.id)}
          />
          <span className="grid h-4 w-4 place-items-center rounded-[4px] border border-[#745bd6] bg-[#745bd6] text-white">
            <Check aria-hidden="true" className="h-3 w-3" />
          </span>
          Superset
        </label>
        <RestTimerControl
          restSeconds={first?.targets[0]?.restSeconds ?? 0}
          routineExerciseId={first?.routineExercise.id ?? ""}
          onRestChange={(_, value) => {
            block.items.forEach((item) =>
              onRestChange(item.routineExercise.id, value)
            );
          }}
        />
      </div>
      <div className="grid gap-2">
        {block.items.map((item) => (
          <ExerciseCard
            dayExercise={item}
            key={item.routineExercise.id}
            onAddDrop={onAddDrop}
            onAddSet={onAddSet}
            onDeleteDrop={onDeleteDrop}
            onDropChange={onDropChange}
            onMenu={onMenu}
            onNotesChange={onNotesChange}
            onOpenDelete={onOpenDelete}
            onOpenDetail={onOpenDetail}
            onOpenReorder={onOpenReorder}
            onRestChange={onRestChange}
            onSuperset={onSuperset}
            onTargetChange={onTargetChange}
            openMenuId={openMenuId}
            setCompletionByRoutineExerciseId={setCompletionByRoutineExerciseId}
            showRestTimer={false}
          />
        ))}
      </div>
    </div>
  );
}

interface ExerciseCardProps
  extends Omit<RoutineBuilderExerciseListProps, "dayExercises"> {
  dayExercise: DayExercise;
  showRestTimer: boolean;
}

function ExerciseCard({
  dayExercise,
  openMenuId,
  setCompletionByRoutineExerciseId,
  showRestTimer,
  onAddDrop,
  onAddSet,
  onDeleteDrop,
  onDropChange,
  onMenu,
  onNotesChange,
  onOpenDelete,
  onOpenDetail,
  onOpenReorder,
  onRestChange,
  onSuperset,
  onTargetChange,
}: ExerciseCardProps) {
  const { exercise, routineExercise, targets } = dayExercise;
  const menuOpen = openMenuId === routineExercise.id;

  return (
    <article className="relative rounded-[16px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(223,232,223,0.64))] p-3 shadow-[0_12px_34px_rgba(14,20,19,0.06)] sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <ExerciseTitle exercise={exercise} routineExercise={routineExercise} />
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <ExerciseImageButton
            dayExercise={dayExercise}
            onOpenDetail={onOpenDetail}
          />
          {showRestTimer ? (
            <RestTimerControl
              restSeconds={targets[0]?.restSeconds ?? 0}
              routineExerciseId={routineExercise.id}
              onRestChange={onRestChange}
            />
          ) : null}
          <div className="relative">
            <Button
              aria-label={`Open actions for ${exercise.name}`}
              className="h-10 w-10 rounded-[12px]"
              onClick={() => onMenu(routineExercise.id)}
              size="icon"
              variant="secondary"
            >
              <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
            </Button>
            {menuOpen ? (
              <ActionMenu
                isSuperset={Boolean(routineExercise.supersetGroupId)}
                onDelete={() => onOpenDelete(dayExercise)}
                onReorder={onOpenReorder}
                onSuperset={() => onSuperset(routineExercise.id)}
              />
            ) : null}
          </div>
        </div>
      </div>

      <NotesControl
        notes={routineExercise.notes}
        routineExerciseId={routineExercise.id}
        onNotesChange={onNotesChange}
      />

      <RoutineBuilderSetTable
        completion={setCompletionByRoutineExerciseId?.get(routineExercise.id)}
        routineExerciseId={routineExercise.id}
        targets={targets}
        onAddDrop={onAddDrop}
        onAddSet={onAddSet}
        onDeleteDrop={onDeleteDrop}
        onDropChange={onDropChange}
        onTargetChange={onTargetChange}
      />
      <p className="mt-3 text-sm text-stone-600">
        {routineExercise.progressionNotes}
      </p>
    </article>
  );
}

function ExerciseImageButton({
  dayExercise,
  onOpenDetail,
}: {
  dayExercise: DayExercise;
  onOpenDetail: (item: DayExercise) => void;
}) {
  return (
    <button
      aria-label={`Open ${dayExercise.exercise.name} details`}
      className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[var(--surface-rail)] shadow-[0_10px_24px_rgba(14,20,19,0.12)] transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]"
      onClick={() => onOpenDetail(dayExercise)}
    >
      <img
        alt=""
        className="h-full w-full object-cover"
        src={dayExercise.exercise.gifUrl}
      />
    </button>
  );
}

function ExerciseTitle({
  exercise,
  routineExercise,
}: {
  exercise: Exercise;
  routineExercise: RoutineExercise;
}) {
  return (
    <div className="min-w-0">
      <h3 className="truncate font-bold">{exercise.name}</h3>
      <p className="truncate text-sm text-stone-600">
        {exercise.targetMuscles.join(", ")} · {exercise.equipment.join(", ")}
      </p>
      {routineExercise.supersetGroupId ? (
        <p className="mt-1 text-xs font-black uppercase text-[#745bd6]">
          Paired set
        </p>
      ) : null}
    </div>
  );
}

function ActionMenu({
  isSuperset,
  onDelete,
  onReorder,
  onSuperset,
}: {
  isSuperset: boolean;
  onDelete: () => void;
  onReorder: () => void;
  onSuperset: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface-panel)] p-1.5 shadow-[0_18px_44px_rgba(14,20,19,0.16)]">
      <MenuButton icon={Shuffle} label="Reorder day" onClick={onReorder} />
      <MenuButton
        icon={Link2}
        label={isSuperset ? "Remove superset" : "Superset with next"}
        onClick={onSuperset}
      />
      <MenuButton destructive icon={Trash2} label="Delete exercise" onClick={onDelete} />
    </div>
  );
}

function MenuButton({
  destructive,
  icon: Icon,
  label,
  onClick,
}: {
  destructive?: boolean;
  icon: typeof Shuffle;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm font-black transition hover:bg-[var(--surface-rail)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]",
        destructive ? "text-[var(--signal-red)]" : "text-[var(--ink)]",
      )}
      onClick={onClick}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </button>
  );
}

function NotesControl({
  notes,
  routineExerciseId,
  onNotesChange,
}: {
  notes: string;
  routineExerciseId: string;
  onNotesChange: (routineExerciseId: string, notes: string) => void;
}) {
  return (
    <label className="mt-3 grid gap-1 rounded-[13px] border border-[var(--line)] bg-white/70 p-3">
      <span className="flex items-center gap-2 font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
        <StickyNote aria-hidden="true" className="h-3.5 w-3.5" />
        Quick note
      </span>
      <textarea
        className="min-h-16 resize-y bg-transparent text-sm font-semibold leading-5 outline-none placeholder:text-[var(--muted)]/70"
        placeholder="Cue, setup, tempo, or substitution note"
        value={notes}
        onChange={(event) => onNotesChange(routineExerciseId, event.target.value)}
      />
    </label>
  );
}

function buildExerciseBlocks(dayExercises: DayExercise[]) {
  const usedGroups = new Set<string>();
  const blocks: Array<
    | { kind: "single"; item: DayExercise }
    | { kind: "superset"; group: string; items: DayExercise[] }
  > = [];

  for (const item of dayExercises) {
    const group = item.routineExercise.supersetGroupId;
    if (!group) {
      blocks.push({ kind: "single", item });
      continue;
    }
    if (usedGroups.has(group)) {
      continue;
    }

    usedGroups.add(group);
    blocks.push({
      kind: "superset",
      group,
      items: dayExercises.filter(
        (candidate) => candidate.routineExercise.supersetGroupId === group
      ),
    });
  }

  return blocks;
}
