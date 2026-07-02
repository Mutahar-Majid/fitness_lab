import {
  bodyPartLabels,
} from "@/lib/domain/analytics";
import type { TrackerState } from "@/lib/domain/types";
import { BodyPartBars } from "@/app/components/tracker/components/BodyPartBars";
import type { AnalyticsSummary } from "@/app/components/tracker/types";

interface AnalyticsViewProps {
  state: TrackerState;
  analytics: AnalyticsSummary;
}

export function AnalyticsView({ state, analytics }: AnalyticsViewProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="panel">
        <p className="eyebrow">Analytics</p>
        <h2 className="section-title">Coach review</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{analytics.focus}</p>
        <BodyPartBars coverage={analytics.coverage} />
      </div>
      <div className="panel">
        <p className="eyebrow">Estimated 1RM</p>
        <h2 className="section-title">Recent PRs</h2>
        <div className="mt-4 grid gap-3">
          {analytics.prs.map((pr) => (
            <article className="exercise-row" key={pr.exercise.id}>
              <div>
                <h3 className="font-semibold">{pr.exercise.name}</h3>
                <p className="text-sm text-stone-600">
                  {pr.set.weight} kg x {pr.set.reps}
                </p>
              </div>
              <span className="badge">{pr.oneRm} kg</span>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">Volume trend</p>
        <h2 className="section-title">Best-performing exercises</h2>
        <div className="mt-4 grid gap-3">
          {analytics.bestExercises.map((item) => (
            <article className="exercise-row" key={item.exercise.id}>
              <div>
                <h3 className="font-semibold">{item.exercise.name}</h3>
                <p className="text-sm text-stone-600">
                  {item.exercise.targetMuscles.join(", ")}
                </p>
              </div>
              <span className="badge">{item.volume} kg</span>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">Consistency</p>
        <h2 className="section-title">Skipped and stalled</h2>
        <div className="mt-4 grid gap-3">
          <InfoLine
            label="Skipped body parts"
            value={
              analytics.skippedBodyParts.length
                ? analytics.skippedBodyParts
                    .map((part) => bodyPartLabels[part])
                    .join(", ")
                : "None"
            }
          />
          <InfoLine
            label="Stalled exercises"
            value={
              analytics.stalledExercises.length
                ? analytics.stalledExercises
                    .map((item) => item.exercise.name)
                    .join(", ")
                : "None"
            }
          />
          <InfoLine
            label="Completed sessions"
            value={String(
              state.workoutSessions.filter((item) => item.status === "completed")
                .length
            )}
          />
        </div>
      </div>
    </section>
  );
}

interface InfoLineProps {
  label: string;
  value: string;
}

function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(223,232,223,0.58))] p-3">
      <p className="font-mono text-[0.68rem] font-black uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
