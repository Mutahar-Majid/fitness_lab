import { CalendarDays, Mail, Ruler, Scale, UserRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsSummary } from "@/app/components/tracker/types";
import { formatDuration } from "@/app/components/tracker/utils";
import { bodyPartLabels } from "@/lib/domain/analytics";
import type { TrackerState } from "@/lib/domain/types";

interface ProfileViewProps {
  state: TrackerState;
  analytics: AnalyticsSummary;
}

const clientProfile = {
  name: "Mutahar Majid",
  email: "mutahar.majid@example.com",
  dob: "1996-04-18",
  sex: "Male",
  height: "178 cm",
};

export function ProfileView({ state, analytics }: ProfileViewProps) {
  const latestMeasurement = [...state.bodyMeasurements].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
  )[0];
  const completedSessions = state.workoutSessions
    .filter((session) => session.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  const topPr = analytics.prs[0];
  const totalMinutes = Math.round(
    completedSessions.reduce(
      (total, session) => total + session.computedDurationSeconds,
      0
    ) / 60
  );

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
      <Card className="overflow-hidden bg-[var(--rubber)] text-white">
        <div className="bg-[radial-gradient(circle_at_84%_12%,rgba(216,184,74,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] border border-white/10 bg-white/10 text-[var(--plate-yellow)]">
              <UserRound aria-hidden="true" className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <Badge variant="dark">Client profile</Badge>
              <h2 className="mt-3 truncate text-3xl font-black leading-none">
                {clientProfile.name}
              </h2>
              <p className="mt-2 text-sm font-semibold text-white/58">
                Active strength block client
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 p-5 sm:p-6">
          <ProfileLine icon={Mail} label="Email" value={clientProfile.email} />
          <ProfileLine icon={CalendarDays} label="DOB" value={clientProfile.dob} />
          <ProfileLine icon={UserRound} label="Sex" value={clientProfile.sex} />
          <ProfileLine
            icon={Scale}
            label="Weight"
            value={
              latestMeasurement?.bodyWeight
                ? `${latestMeasurement.bodyWeight} kg`
                : "Not logged"
            }
          />
          <ProfileLine icon={Ruler} label="Height" value={clientProfile.height} />
        </div>
      </Card>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Sessions"
            value={String(completedSessions.length)}
            detail="completed"
          />
          <StatCard label="Training time" value={`${totalMinutes}`} detail="minutes" />
          <StatCard
            label="Top lift"
            value={topPr ? `${topPr.oneRm} kg` : "-"}
            detail={topPr?.exercise.name ?? "no PR yet"}
          />
        </div>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Analytics</p>
              <h2 className="section-title">Client snapshot</h2>
            </div>
            <Badge variant="steel">
              {analytics.workingSets.length} working sets
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoTile label="Coach note" value={analytics.focus} />
            <InfoTile
              label="Focus areas"
              value={
                latestMeasurement?.weakAreas.length
                  ? latestMeasurement.weakAreas
                      .map((part) => bodyPartLabels[part])
                      .join(", ")
                  : "None logged"
              }
            />
          </div>
        </Card>

        <Card className="p-5">
          <p className="eyebrow">Workout history</p>
          <h2 className="section-title">Recent sessions</h2>
          <div className="mt-4 grid gap-2">
            {completedSessions.slice(0, 5).map((session) => (
              <article
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface-rail)] p-3"
                key={session.id}
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black">
                    {new Date(session.startedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="truncate text-xs font-bold text-[var(--muted)]">
                    {session.notes || "Completed workout"}
                  </p>
                </div>
                <span className="font-mono text-xs font-black uppercase text-[var(--steel-blue)]">
                  {formatDuration(session.computedDurationSeconds)}
                </span>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

interface ProfileLineProps {
  icon: typeof Mail;
  label: string;
  value: string;
}

function ProfileLine({ icon: Icon, label, value }: ProfileLineProps) {
  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-[13px] border border-white/10 bg-white/7 p-3">
      <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/8 text-[var(--plate-yellow)]">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[0.62rem] font-black uppercase text-white/42">
          {label}
        </span>
        <span className="block truncate text-sm font-bold text-white/78">
          {value}
        </span>
      </span>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
}

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="font-mono text-[0.68rem] font-black uppercase text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 truncate text-3xl font-black leading-none">{value}</p>
      <p className="mt-1 truncate text-xs font-bold text-[var(--muted)]">
        {detail}
      </p>
    </Card>
  );
}

interface InfoTileProps {
  label: string;
  value: string;
}

function InfoTile({ label, value }: InfoTileProps) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-rail)] p-3">
      <p className="font-mono text-[0.68rem] font-black uppercase text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6">{value}</p>
    </div>
  );
}
