"use client";

import Image from "next/image";
import {
  Bot,
  Dumbbell,
  Gauge,
  House,
  LibraryBig,
  Menu,
  PanelLeftClose,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { tabs } from "@/app/components/tracker/constants";
import type { Tab } from "@/app/components/tracker/types";
import { cn } from "@/lib/utils";

interface TrackerChromeProps {
  currentTab: Tab;
  isSidebarExpanded: boolean;
  onSidebarExpandedChange: (expanded: boolean) => void;
  onTabChange: (tab: Tab) => void;
}

const tabIcons: Record<Tab, LucideIcon> = {
  dashboard: House,
  routines: Dumbbell,
  builder: Dumbbell,
  workout: Dumbbell,
  library: LibraryBig,
  analytics: Gauge,
  coach: Bot,
  profile: UserRound,
};

const mobileTabs: Array<{ id: Tab; label: string }> = [
  { id: "dashboard", label: "Home" },
  { id: "routines", label: "Workout" },
  { id: "coach", label: "AI Coach" },
];

const primaryNavTabs: Array<{ id: Tab; label: string }> = [
  { id: "dashboard", label: "Home" },
  { id: "routines", label: "Workout" },
  { id: "coach", label: "AI Coach" },
];

export function TrackerChrome({
  currentTab,
  isSidebarExpanded,
  onSidebarExpandedChange,
  onTabChange,
}: TrackerChromeProps) {

  return (
    <>
      <header className="sticky top-3 z-30 rounded-[14px] border border-white/10 bg-[rgba(12,17,17,0.82)] px-3 py-3 text-white shadow-[0_18px_60px_rgba(5,9,9,0.26)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandLockup />
          <Button
            aria-label="Open profile"
            className={cn(
              "border-white/12 bg-white/8 text-white hover:border-white/24 hover:bg-white/14",
              currentTab === "profile" && "border-[var(--plate-yellow)] text-[var(--plate-yellow)]",
            )}
            onClick={() => onTabChange("profile")}
            size="icon"
            variant="secondary"
          >
            <UserRound aria-hidden="true" />
          </Button>
        </div>
      </header>

      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-40 hidden flex-col rounded-[18px] border border-white/10 bg-[rgba(12,17,17,0.92)] p-3 text-white shadow-[0_24px_80px_rgba(5,9,9,0.32)] backdrop-blur-xl transition-[width] duration-200 md:flex",
          isSidebarExpanded ? "w-64" : "w-20",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            !isSidebarExpanded && "flex-col",
          )}
        >
          <BrandLockup
            compact={!isSidebarExpanded}
          />
          <button
            aria-label={isSidebarExpanded ? "Collapse navigation" : "Expand navigation"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]"
            onClick={() => onSidebarExpandedChange(!isSidebarExpanded)}
          >
            {isSidebarExpanded ? (
              <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Menu aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav aria-label="Primary sections" className="mt-6 grid gap-2">
          {primaryNavTabs.map((item) => {
            const Icon = tabIcons[item.id];
            const isActive = currentTab === item.id;

            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-[13px] px-3 text-sm font-black text-white/58 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]",
                  isActive &&
                  "bg-white text-[var(--ink)] shadow-[0_14px_28px_rgba(0,0,0,0.22)]",
                  !isSidebarExpanded && "justify-center px-0",
                )}
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={!isSidebarExpanded ? item.label : undefined}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {isSidebarExpanded ? (
                  <span className="truncate">{item.label}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-auto rounded-[14px] border border-white/10 bg-white/7 p-3",
            !isSidebarExpanded && "px-2 text-center",
          )}
        >
          <p className="font-mono text-[0.62rem] font-black uppercase text-[var(--plate-yellow)]">
            Today
          </p>
          {isSidebarExpanded ? (
            <p className="mt-1 text-sm font-bold leading-5 text-white/64">
              Open the dashboard to start the next planned lift.
            </p>
          ) : null}
          <button
            className={cn(
              "mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-[11px] border border-white/10 bg-white/8 px-2 text-xs font-black text-white/66 transition hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]",
              currentTab === "profile" && "border-[var(--plate-yellow)] text-[var(--plate-yellow)]",
            )}
            onClick={() => onTabChange("profile")}
            title={!isSidebarExpanded ? "Profile" : undefined}
          >
            <UserRound aria-hidden="true" className="h-4 w-4" />
            {isSidebarExpanded ? <span>Client profile</span> : null}
          </button>
        </div>
      </aside>

      <nav
        aria-label="Mobile primary sections"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 rounded-[16px] border border-white/10 bg-[rgba(12,17,17,0.9)] p-1.5 text-white shadow-[0_18px_60px_rgba(5,9,9,0.38)] backdrop-blur-xl md:hidden"
      >
        {mobileTabs.map((mobileTab) => {
          const item = tabs.find((candidate) => candidate.id === mobileTab.id);
          if (!item) {
            return null;
          }

          const Icon = tabIcons[item.id];
          const isActive = currentTab === item.id;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[12px] px-1 text-[0.68rem] font-black text-white/56 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plate-yellow)]",
                isActive &&
                "bg-white text-[var(--ink)] shadow-[0_8px_22px_rgba(0,0,0,0.2)]",
              )}
              key={item.id}
              onClick={() => onTabChange(item.id)}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span className="w-full truncate text-center">
                {mobileTab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

interface BrandLockupProps {
  compact?: boolean;
}

function BrandLockup({ compact }: BrandLockupProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        compact && "justify-center",
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-white/10 text-[var(--plate-yellow)] shadow-[inset_0_-5px_0_rgba(216,184,74,0.2)]">
        <Image
          alt=""
          aria-hidden="true"
          className="h-8 w-8"
          height={32}
          src="/fitness-lab-logo.svg"
          width={32}
        />
      </div>
      {compact ? null : (
        <div className="min-w-0">
          <h1 className="font-mono text-l font-black uppercase text-[var(--plate-yellow)]">
            Strength lab
          </h1>
        </div>
      )}
      {compact ? <span className="sr-only">Strength lab</span> : null}
    </div>
  );
}
