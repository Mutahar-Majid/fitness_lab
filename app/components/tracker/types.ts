import type { summarizeAnalytics } from "@/lib/domain/analytics";
import type { TrackerState } from "@/lib/domain/types";

export type Tab =
  | "dashboard"
  | "routines"
  | "builder"
  | "workout"
  | "library"
  | "analytics"
  | "coach"
  | "profile";

export interface TabItem {
  id: Tab;
  label: string;
}

export type AnalyticsSummary = ReturnType<typeof summarizeAnalytics>;

export type AddSetValues = {
  weight: number;
  reps: number;
  setType: TrackerState["performedSets"][number]["setType"];
  isFailure: boolean;
  setNumber?: number;
  dropIndex?: number;
  notes?: string;
  parentSetId?: string;
};

export type PerformedSetsByWorkoutExerciseId = Map<
  string,
  TrackerState["performedSets"]
>;
