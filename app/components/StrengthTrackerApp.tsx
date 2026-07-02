"use client";

import { useState } from "react";

import { TrainingBrief } from "@/app/components/tracker/components/TrainingBrief";
import { TrackerChrome } from "@/app/components/tracker/components/TrackerChrome";
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

export default function StrengthTrackerApp() {
  const tracker = useStrengthTrackerState();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);

  const navigateToTab = (tab: Tab) => {
    if (tab === tracker.tab || pendingTab) {
      return;
    }

    setPendingTab(tab);
    window.setTimeout(() => {
      tracker.setTab(tab);
      setPendingTab(null);
    }, 420);
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
            onOpenBuilder={() => navigateToTab("builder")}
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
              onCreate={tracker.createRoutine}
              onDuplicate={tracker.duplicateRoutineById}
              onDelete={tracker.deleteRoutineById}
              onOpenBuilder={() => navigateToTab("builder")}
              onOpenLibrary={() => navigateToTab("library")}
            />
          ) : null}
          {tracker.tab === "builder" && tracker.selectedDay ? (
            <RoutineBuilderView
              state={tracker.state}
              selectedDay={tracker.selectedDay}
              dayExercises={tracker.selectedDayExercises}
              onSelectDay={tracker.selectRoutineDay}
              onDragStart={tracker.setDraggedRoutineExerciseId}
              onDrop={tracker.dropRoutineExercise}
              onSuperset={tracker.createSupersetWithNext}
              onTargetChange={tracker.updateTarget}
              onOpenLibrary={() => navigateToTab("library")}
            />
          ) : null}
          {tracker.tab === "workout" ? (
            <ActiveWorkoutView
              activeSession={tracker.activeSession}
              activeSessionDuration={tracker.activeSessionDuration}
              workoutExercises={tracker.activeWorkoutExercises}
              exerciseById={tracker.exerciseById}
              setsByWorkoutExerciseId={tracker.setsByWorkoutExerciseId}
              onStart={tracker.startSelectedDay}
              onPause={tracker.pauseActiveSession}
              onResume={tracker.resumeActiveSession}
              onComplete={tracker.completeActiveSession}
              onAddSet={tracker.addSetToWorkoutExercise}
            />
          ) : null}
          {tracker.tab === "library" ? (
            <ExerciseLibraryView
              query={tracker.exerciseQuery}
              bodyPart={tracker.bodyPart}
              equipment={tracker.equipment}
              equipmentOptions={tracker.equipmentOptions}
              exercises={tracker.filteredExercises}
              expandedExerciseId={tracker.expandedExerciseId}
              selectedDay={tracker.selectedDay}
              onQuery={tracker.setExerciseQuery}
              onBodyPart={tracker.setBodyPart}
              onEquipment={tracker.setEquipment}
              onExpand={tracker.toggleExpandedExercise}
              onAdd={tracker.addExerciseToSelectedDay}
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

      </div>
    </main>
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
