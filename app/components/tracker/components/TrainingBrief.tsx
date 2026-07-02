"use client";

import { useState } from "react";
import { ArrowUpRight, Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/app/components/tracker/types";
import type { RoutineDay, WorkoutSession } from "@/lib/domain/types";
import type { getRoutineDayExercises } from "@/lib/domain/analytics";
import { setVolume } from "@/lib/domain/analytics";
import { cn } from "@/lib/utils";

interface TrainingBriefProps {
  analytics: AnalyticsSummary;
  activeRoutineName: string;
  selectedDay?: RoutineDay;
  dayExercises: ReturnType<typeof getRoutineDayExercises>;
  activeSession?: WorkoutSession;
  activeSessionDuration: number;
  onOpenBuilder: () => void;
  onStart: () => void;
}

export function TrainingBrief({
  analytics,
  activeRoutineName,
  selectedDay,
  dayExercises,
  activeSession,
  activeSessionDuration,
  onOpenBuilder,
  onStart,
}: TrainingBriefProps) {
  const exerciseCount = dayExercises.length;
  const setCount = dayExercises.reduce(
    (total, item) => total + item.targets.length,
    0,
  );
  const readiness = Math.max(
    42,
    Math.min(96, 88 - analytics.skippedBodyParts.length * 7),
  );

  return (
    <section className="grid gap-3 py-4 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="relative overflow-hidden border-white/10 bg-[var(--rubber)] text-white shadow-[0_26px_70px_rgba(8,12,12,0.28)]">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_28%,rgba(216,184,74,0.24),transparent_34%),linear-gradient(135deg,rgba(49,95,120,0.34),transparent_56%)] sm:block" />
        <div className="relative grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="dark">{activeSession ? "Live session" : "Next lift"}</Badge>
              <span className="font-mono text-xs font-black uppercase text-white/52">
                {selectedDay?.name ?? "Choose a day"}
              </span>
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-[0.96] tracking-normal sm:text-5xl">
              {activeRoutineName}
            </h2>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/68">
              {exerciseCount} exercises, {setCount} planned sets. The console is
              tuned for logging fast between working sets.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                className="border-[var(--plate-yellow)] bg-[var(--plate-yellow)] text-[var(--ink)] hover:border-white hover:bg-white"
                onClick={onStart}
              >
                <Flame aria-hidden="true" />
                {activeSession ? "Resume workout" : "Start workout"}
              </Button>
              <Button
                className="border-white/15 bg-white/8 text-white hover:border-white/25 hover:bg-white/14"
                onClick={onOpenBuilder}
                variant="secondary"
              >
                Edit plan
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-4 sm:block sm:w-40">
            <div
              aria-label={`${readiness} percent training readiness`}
              className="grid h-32 w-32 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--signal-green) ${readiness}%, rgba(255,255,255,0.12) 0)`,
              }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-[var(--rubber)] text-center shadow-[inset_0_0_26px_rgba(0,0,0,0.32)]">
                <span>
                  <span className="block text-3xl font-black leading-none">
                    {readiness}
                  </span>
                  <span className="font-mono text-[0.62rem] font-black uppercase text-white/50">
                    ready
                  </span>
                </span>
              </div>
            </div>
            <div className="self-center sm:mt-4">
              <p className="font-mono text-xs font-black uppercase text-white/44">
                Coach signal
              </p>
              <p className="mt-1 text-sm font-bold leading-5 text-white/72">
                {analytics.skippedBodyParts.length
                  ? `${analytics.skippedBodyParts.length} areas need attention`
                  : "Balanced week so far"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <PerformanceGraph
        analytics={analytics}
        activeSession={activeSession}
        activeSessionDuration={activeSessionDuration}
      />
    </section>
  );
}

type GraphMode = "volume" | "weight" | "duration";

const graphTabs: Array<{ id: GraphMode; label: string }> = [
  { id: "volume", label: "Volume" },
  { id: "weight", label: "Weight" },
  { id: "duration", label: "Duration" },
];

interface PerformanceGraphProps {
  analytics: AnalyticsSummary;
  activeSession?: WorkoutSession;
  activeSessionDuration: number;
}

function PerformanceGraph({
  analytics,
  activeSession,
  activeSessionDuration,
}: PerformanceGraphProps) {
  const [mode, setMode] = useState<GraphMode>("volume");
  const series = buildGraphSeries(analytics, mode, activeSessionDuration);
  const maxValue = Math.max(...series.map((item) => item.value), 1);
  const total = series.reduce((sum, item) => sum + item.value, 0);
  const latest = series[series.length - 1]?.value ?? 0;
  const value =
    mode === "duration"
      ? `${Math.round(latest)} min`
      : mode === "weight"
        ? `${Math.round(latest * 10) / 10} kg`
        : `${Math.round(total).toLocaleString()} kg`;

  return (
    <Card className="grid min-h-[18rem] gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.68rem] font-black uppercase text-[var(--steel-blue)]">
            Training graph
          </p>
          <p className="mt-1 text-3xl font-black leading-none">{value}</p>
          <p className="mt-1 text-xs font-bold text-[var(--muted)]">
            {mode === "volume"
              ? "total load across recent sessions"
              : mode === "weight"
                ? "heaviest working set per session"
                : activeSession
                  ? "active and completed session time"
                  : "completed session duration"}
          </p>
        </div>
        {analytics.prs.length ? <Badge>{analytics.prs.length} PRs</Badge> : null}
      </div>

      <div className="grid grid-cols-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface-rail)] p-1">
        {graphTabs.map((tab) => (
          <button
            aria-pressed={mode === tab.id}
            className={cn(
              "min-h-9 rounded-[9px] px-2 text-xs font-black text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]",
              mode === tab.id &&
                "bg-[var(--surface-panel)] text-[var(--ink)] shadow-[0_7px_18px_rgba(14,20,19,0.09)]",
            )}
            key={tab.id}
            onClick={() => setMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-32 grid-cols-6 items-end gap-2">
        {series.map((item) => (
          <div className="grid gap-2" key={item.label}>
            <div className="flex h-28 items-end rounded-[10px] bg-[var(--surface-rail)] p-1">
              <div
                aria-label={`${item.label}: ${item.value}`}
                className="w-full rounded-[7px] bg-[linear-gradient(180deg,var(--signal-green),var(--steel-blue))] shadow-[inset_0_6px_12px_rgba(255,255,255,0.16)]"
                style={{
                  height: `${Math.max(12, (item.value / maxValue) * 100)}%`,
                }}
              />
            </div>
            <span className="truncate text-center font-mono text-[0.62rem] font-black uppercase text-[var(--muted)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function buildGraphSeries(
  analytics: AnalyticsSummary,
  mode: GraphMode,
  activeSessionDuration: number
) {
  const sessions = [...analytics.completedSessions]
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )
    .slice(-6);
  const recentSessions =
    sessions.length > 0
      ? sessions
      : [
          {
            id: "current",
            startedAt: new Date().toISOString(),
            computedDurationSeconds: activeSessionDuration,
          },
        ];

  return recentSessions.map((session, index) => {
    const sets = analytics.workingSets.filter(
      (set) => set.workoutSessionId === session.id
    );
    const valueByMode: Record<GraphMode, number> = {
      volume: sets.reduce((total, set) => total + setVolume(set), 0),
      weight: Math.max(...sets.map((set) => set.weight), 0),
      duration: Math.round(session.computedDurationSeconds / 60),
    };

    return {
      label: `S${index + 1}`,
      value: valueByMode[mode],
    };
  });
}
