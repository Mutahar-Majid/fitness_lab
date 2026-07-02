import type {
  getRoutineDayExercises,
} from "@/lib/domain/analytics";
import type { RoutineDay, WorkoutSession } from "@/lib/domain/types";
import { BodyPartBars } from "@/app/components/tracker/components/BodyPartBars";
import type { AnalyticsSummary } from "@/app/components/tracker/types";
import { formatDuration } from "@/app/components/tracker/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/app/components/tracker/ui";

interface DashboardViewProps {
  analytics: AnalyticsSummary;
  activeRoutineName: string;
  selectedDay?: RoutineDay;
  dayExercises: ReturnType<typeof getRoutineDayExercises>;
  onStart: () => void;
  onOpenAnalytics: () => void;
  activeSession?: WorkoutSession;
  activeSessionDuration: number;
}

export function DashboardView({
  analytics,
  activeRoutineName,
  selectedDay,
  dayExercises,
  onStart,
  onOpenAnalytics,
  activeSession,
  activeSessionDuration,
}: DashboardViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="p-4 pb-0 sm:p-5 sm:pb-0">
            <SectionHeader
              eyebrow="Set list"
              title={selectedDay?.name ?? activeRoutineName}
            />
          </div>
          <div className="px-4 sm:px-5 sm:pt-5">
            <PrimaryButton
              className="w-full shrink-0 whitespace-nowrap sm:w-auto"
              onClick={onStart}
            >
              Start {selectedDay?.name ?? "workout"}
            </PrimaryButton>
          </div>
        </div>

        <div className="grid gap-2 p-4 sm:p-5">
          {dayExercises.slice(0, 5).map(({ exercise, targets, group }) => (
            <article
              className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-3 py-2.5 transition hover:border-[var(--line-strong)] hover:bg-white"
              key={exercise.id}
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black">{exercise.name}</h3>
                {group ? (
                  <p className="truncate text-xs font-bold text-[var(--steel-blue)]">
                    {group}
                  </p>
                ) : null}
              </div>
              <span className="rounded-[10px] bg-[var(--rubber)] px-3 py-2 font-mono text-xs font-black uppercase text-white">
                {targets.length} x {targets[0]?.targetReps ?? "-"}
              </span>
            </article>
          ))}
        </div>
      </Card>

      <aside className="overflow-hidden rounded-[18px] border border-white/10 bg-[var(--rubber)] text-white shadow-[0_22px_60px_rgba(8,12,12,0.24)]">
        <div className="border-b border-white/10 bg-white/6 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.68rem] font-black uppercase text-[var(--plate-yellow)]">
                Coach review
              </p>
              <h2 className="mt-1 text-2xl font-black leading-none">
                This week
              </h2>
            </div>
            {activeSession && (
              <Badge variant="dark">
                Live {formatDuration(activeSessionDuration)}
              </Badge>
            )}
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/66">
            {analytics.focus}
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <BodyPartBars coverage={analytics.coverage} />
          <SecondaryButton
            className="mt-5 w-full border-white/12 bg-white/8 text-white hover:border-white/24 hover:bg-white/14"
            onClick={onOpenAnalytics}
          >
            Review analytics
          </SecondaryButton>
        </div>
      </aside>
    </div>
  );
}
