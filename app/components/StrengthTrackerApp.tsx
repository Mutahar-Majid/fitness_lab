"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrainingBrief } from "@/app/components/tracker/components/TrainingBrief";
import { TrackerChrome } from "@/app/components/tracker/components/TrackerChrome";
import { useRoutineDraft } from "@/app/components/tracker/hooks/useRoutineDraft";
import { useStrengthTrackerState } from "@/app/components/tracker/hooks/useStrengthTrackerState";
import type { Tab } from "@/app/components/tracker/types";
import { ActiveWorkoutView } from "@/app/components/tracker/views/ActiveWorkoutView";
import { AnalyticsView } from "@/app/components/tracker/views/AnalyticsView";
import { CoachPlaceholderView } from "@/app/components/tracker/views/CoachPlaceholderView";
import { DashboardView } from "@/app/components/tracker/views/DashboardView";
import { ExerciseLibraryView } from "@/app/components/tracker/views/ExerciseLibraryView";
import { ProfileView } from "@/app/components/tracker/views/ProfileView";
import { RoutineBuilderView } from "@/app/components/tracker/views/RoutineBuilderView";
import { RoutinesView } from "@/app/components/tracker/views/RoutinesView";
import { cn } from "@/lib/utils";

type PendingRoutineAction = {
  onDiscard: () => void;
  onSave: () => void;
};

export default function StrengthTrackerApp() {
  const tracker = useStrengthTrackerState();
  const routineDraft = useRoutineDraft();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeWorkoutMenuId, setActiveWorkoutMenuId] = useState("");
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);
  const [pendingRoutineAction, setPendingRoutineAction] = useState<PendingRoutineAction | null>(
    null
  );
  const beginRoutineDraft = routineDraft.begin;
  const routineDraftState = routineDraft.state;
  const builderState = routineDraftState ?? tracker.state;
  const builderSelectedDay = routineDraft.selectedDay ?? tracker.selectedDay;
  const builderDayExercises =
    routineDraftState && routineDraft.selectedDay
      ? routineDraft.dayExercises
      : tracker.selectedDayExercises;
  const isWorkoutDraft =
    Boolean(routineDraftState) &&
    routineDraft.selectedDay?.id === tracker.activeSession?.routineDayId;
  const activeWorkoutDayExercises =
    isWorkoutDraft && routineDraft.selectedDay
      ? routineDraft.dayExercises
      : tracker.activeSessionDayExercises;
  const activeWorkoutRoutineState =
    isWorkoutDraft && routineDraftState ? routineDraftState : tracker.state;
  const activeWorkoutDayName =
    (isWorkoutDraft
      ? routineDraft.selectedDay?.name
      : tracker.state.routineDays.find(
          (day) => day.id === tracker.activeSession?.routineDayId
        )?.name) ?? "Workout";
  const libraryExercises = routineDraftState
    ? routineDraft.filterDraftExercises(
        tracker.exerciseQuery,
        tracker.bodyPart,
        tracker.equipment
      )
    : tracker.filteredExercises;

  useEffect(() => {
    if (tracker.tab === "builder" && !routineDraftState && tracker.selectedDay) {
      beginRoutineDraft(tracker.state, tracker.selectedDay.id);
    }
    if (
      tracker.tab === "workout" &&
      tracker.activeSession &&
      routineDraft.selectedDay?.id !== tracker.activeSession.routineDayId
    ) {
      beginRoutineDraft(tracker.state, tracker.activeSession.routineDayId);
    }
  }, [
    beginRoutineDraft,
    routineDraft.selectedDay,
    routineDraftState,
    tracker.activeSession,
    tracker.selectedDay,
    tracker.state,
    tracker.tab,
  ]);

  const runWithRoutineGuard = (action: () => void) => {
    if (
      routineDraft.hasChanges &&
      (tracker.tab === "builder" ||
        tracker.tab === "library" ||
        tracker.tab === "workout")
    ) {
      setPendingRoutineAction({ onDiscard: action, onSave: action });
      return;
    }

    action();
  };

  const navigateToTabDirect = (tab: Tab) => {
    if (tab === tracker.tab || pendingTab) {
      return;
    }

    setPendingTab(tab);
    window.setTimeout(() => {
      tracker.setTab(tab);
      setPendingTab(null);
    }, 420);
  };
  const navigateToTab = (tab: Tab) => {
    const staysInRoutineEdit =
      routineDraftState && ["builder", "library"].includes(tab);

    if (staysInRoutineEdit) {
      navigateToTabDirect(tab);
      return;
    }

    runWithRoutineGuard(() => {
      routineDraft.clear();
      navigateToTabDirect(tab);
    });
  };

  const openBuilder = (dayId: string) => {
    routineDraft.begin(tracker.state, dayId);
    tracker.setTab("builder");
  };

  const saveRoutineDraft = () => {
    if (!routineDraftState) {
      return;
    }

    tracker.replaceRoutineState(routineDraftState);
    routineDraft.markSaved();
  };

  const saveAndContinue = () => {
    saveRoutineDraft();
    const action = pendingRoutineAction?.onSave;
    setPendingRoutineAction(null);
    routineDraft.clear();
    action?.();
  };

  const discardAndContinue = () => {
    const action = pendingRoutineAction?.onDiscard;
    setPendingRoutineAction(null);
    routineDraft.clear();
    action?.();
  };

  const finishActiveWorkout = () => {
    if (routineDraft.hasChanges && routineDraftState) {
      setPendingRoutineAction({
        onDiscard: () => tracker.completeActiveSession(),
        onSave: () => tracker.completeActiveSession(routineDraftState),
      });
      return;
    }

    routineDraft.clear();
    tracker.completeActiveSession();
  };

  const discardActiveWorkout = () => {
    routineDraft.clear();
    tracker.discardActiveSession();
  };

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--ink)]">
      <div
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 pb-28 pt-3 transition-[padding] duration-200 sm:px-6 md:pb-10 md:pr-8",
          isSidebarExpanded ? "md:pl-[18.25rem]" : "md:pl-24",
        )}
      >
        <TrackerChrome
          currentTab={tracker.tab}
          isSidebarExpanded={isSidebarExpanded}
          onSidebarExpandedChange={setIsSidebarExpanded}
          onTabChange={navigateToTab}
        />

        {tracker.tab === "dashboard" ? (
          <TrainingBrief
            activeRoutineName={tracker.activeRoutine?.name ?? "No active routine"}
            activeSession={tracker.activeSession}
            activeSessionDuration={tracker.activeSessionDuration}
            analytics={tracker.analytics}
            dayExercises={tracker.selectedDayExercises}
            onOpenBuilder={() =>
              tracker.selectedDay ? openBuilder(tracker.selectedDay.id) : undefined
            }
            onStart={tracker.startSelectedDay}
            selectedDay={tracker.selectedDay}
          />
        ) : null}

        <section className="relative min-h-0 flex-1">
          {pendingTab ? <PageTransitionOverlay tab={pendingTab} /> : null}
          {tracker.tab === "dashboard" ? (
            <DashboardView
              analytics={tracker.analytics}
              activeRoutineName={tracker.activeRoutine?.name ?? "No active routine"}
              selectedDay={tracker.selectedDay}
              dayExercises={tracker.selectedDayExercises}
              onStart={tracker.startSelectedDay}
              onOpenAnalytics={() => navigateToTab("analytics")}
              activeSession={tracker.activeSession}
              activeSessionDuration={tracker.activeSessionDuration}
            />
          ) : null}
          {tracker.tab === "routines" ? (
            <RoutinesView
              state={tracker.state}
              selectedDayId={tracker.selectedDay?.id ?? ""}
              onSelectDay={tracker.selectRoutineDay}
              onEditDay={openBuilder}
              onStartDay={tracker.startRoutineDay}
              onCreate={tracker.createRoutine}
              onDuplicate={tracker.duplicateRoutineById}
              onDelete={tracker.deleteRoutineById}
            />
          ) : null}
          {tracker.tab === "builder" && builderSelectedDay ? (
            <RoutineBuilderView
              state={builderState}
              selectedDay={builderSelectedDay}
              dayExercises={builderDayExercises}
              hasChanges={routineDraft.hasChanges}
              onSelectDay={routineDraft.selectDay}
              onDragStart={routineDraft.setDraggedRoutineExerciseId}
              onDrop={routineDraft.dropRoutineExercise}
              onSuperset={routineDraft.createSupersetWithNext}
              onTargetChange={routineDraft.updateTarget}
              onAddDrop={routineDraft.addDropTarget}
              onAddDay={routineDraft.addRoutineDay}
              onAddSet={routineDraft.addRoutineSet}
              onBack={() =>
                runWithRoutineGuard(() => {
                  routineDraft.clear();
                  navigateToTabDirect("routines");
                })
              }
              onDeleteDrop={routineDraft.deleteDropTarget}
              onDeleteExercise={routineDraft.deleteRoutineExerciseById}
              onOpenLibrary={() => navigateToTab("library")}
              onRestChange={routineDraft.updateExerciseRestTargets}
              onRenameDay={routineDraft.renameRoutineDay}
              onRenameRoutine={routineDraft.renameRoutine}
              onNotesChange={routineDraft.updateRoutineExerciseNotes}
              onDropChange={routineDraft.updateDropTarget}
              onSave={saveRoutineDraft}
            />
          ) : null}
          {tracker.tab === "workout" ? (
            <ActiveWorkoutView
              activeSession={tracker.activeSession}
              activeSessionDuration={tracker.activeSessionDuration}
              dayExercises={activeWorkoutDayExercises}
              openMenuId={activeWorkoutMenuId}
              routineState={activeWorkoutRoutineState}
              selectedDayName={activeWorkoutDayName}
              setsByWorkoutExerciseId={tracker.setsByWorkoutExerciseId}
              workoutExercises={tracker.activeWorkoutExercises}
              onAddDrop={routineDraft.addDropTarget}
              onAddTargetSet={routineDraft.addRoutineSet}
              onComplete={finishActiveWorkout}
              onDiscard={discardActiveWorkout}
              onAddSet={tracker.addSetToWorkoutExercise}
              onDeleteDrop={routineDraft.deleteDropTarget}
              onDeleteExercise={routineDraft.deleteRoutineExerciseById}
              onDeleteSet={tracker.deleteSetFromWorkout}
              onDragStart={routineDraft.setDraggedRoutineExerciseId}
              onDrop={routineDraft.dropRoutineExercise}
              onDropChange={routineDraft.updateDropTarget}
              onMenu={(id) =>
                setActiveWorkoutMenuId((current) => (current === id ? "" : id))
              }
              onNotesChange={routineDraft.updateRoutineExerciseNotes}
              onRestChange={routineDraft.updateExerciseRestTargets}
              onSuperset={routineDraft.createSupersetWithNext}
              onTargetChange={routineDraft.updateTarget}
            />
          ) : null}
          {tracker.tab === "library" ? (
            <ExerciseLibraryView
              query={tracker.exerciseQuery}
              bodyPart={tracker.bodyPart}
              equipment={tracker.equipment}
              equipmentOptions={tracker.equipmentOptions}
              exercises={libraryExercises}
              expandedExerciseId={tracker.expandedExerciseId}
              selectedDay={builderSelectedDay}
              onQuery={tracker.setExerciseQuery}
              onBodyPart={tracker.setBodyPart}
              onEquipment={tracker.setEquipment}
              onExpand={tracker.toggleExpandedExercise}
              onAdd={(exerciseIds) => {
                if (routineDraftState) {
                  routineDraft.addExercisesToSelectedDay(exerciseIds);
                  tracker.setTab("builder");
                  return;
                }

                tracker.addExercisesToSelectedDay(exerciseIds);
              }}
            />
          ) : null}
          {tracker.tab === "analytics" ? (
            <AnalyticsView state={tracker.state} analytics={tracker.analytics} />
          ) : null}
          {tracker.tab === "coach" ? <CoachPlaceholderView /> : null}
          {tracker.tab === "profile" ? (
            <ProfileView state={tracker.state} analytics={tracker.analytics} />
          ) : null}
        </section>

        <UnsavedRoutineDialog
          open={Boolean(pendingRoutineAction)}
          onCancel={() => setPendingRoutineAction(null)}
          onDiscard={discardAndContinue}
          onSave={saveAndContinue}
        />

      </div>
    </main>
  );
}

function UnsavedRoutineDialog({
  open,
  onCancel,
  onDiscard,
  onSave,
}: {
  open: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">Unsaved routine</p>
          <DialogTitle>Save routine changes?</DialogTitle>
          <DialogDescription>
            Your edits are still in draft. Save them before leaving, or discard
            the draft and continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="primary-button" onClick={onSave}>
            Save changes
          </button>
          <button className="secondary-button" onClick={onDiscard}>
            Discard
          </button>
          <DialogClose asChild>
            <button className="secondary-button">Cancel</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PageTransitionOverlayProps {
  tab: Tab;
}

function PageTransitionOverlay({ tab }: PageTransitionOverlayProps) {
  const labelByTab: Record<Tab, string> = {
    dashboard: "Loading home",
    routines: "Loading workout",
    builder: "Opening builder",
    workout: "Starting workout",
    library: "Loading library",
    analytics: "Loading analytics",
    coach: "Loading AI coach",
    profile: "Loading profile",
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid min-h-72 place-items-center rounded-[18px] bg-[rgba(232,238,233,0.84)] p-4 backdrop-blur-md">
      <div className="w-full max-w-sm overflow-hidden rounded-[18px] border border-white/12 bg-[var(--rubber)] text-white shadow-[0_24px_70px_rgba(8,12,12,0.3)]">
        <div className="flex items-center gap-4 p-5">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8">
            <span className="absolute inset-1 animate-spin rounded-full border-2 border-white/12 border-t-[var(--plate-yellow)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--signal-green)]" />
          </span>
          <span>
            <span className="block font-mono text-[0.68rem] font-black uppercase text-[var(--plate-yellow)]">
              Transition
            </span>
            <span className="mt-1 block text-xl font-black leading-none">
              {labelByTab[tab]}
            </span>
            <span className="mt-2 block text-sm font-semibold text-white/55">
              Preparing the training console.
            </span>
          </span>
        </div>
        <div className="h-1.5 bg-white/8">
          <div className="h-full w-2/3 animate-pulse bg-[var(--plate-yellow)]" />
        </div>
      </div>
    </div>
  );
}
