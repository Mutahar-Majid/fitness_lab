import type { TabItem } from "@/app/components/tracker/types";

export const tabs: TabItem[] = [
  { id: "dashboard", label: "Home" },
  { id: "routines", label: "Workout" },
  { id: "builder", label: "Builder" },
  { id: "workout", label: "Active workout" },
  { id: "library", label: "Library" },
  { id: "analytics", label: "Analytics" },
  { id: "coach", label: "AI Coach" },
  { id: "profile", label: "Profile" },
];

export const restPresets = [60, 90, 180];
