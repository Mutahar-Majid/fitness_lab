/* eslint-disable @next/next/no-img-element */

import type { Exercise } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

interface ExerciseDemoMediaProps {
  exercise: Exercise;
  className?: string;
  imageClassName?: string;
  onOpen?: () => void;
}

export function ExerciseDemoMedia({
  exercise,
  className,
  imageClassName,
  onOpen,
}: ExerciseDemoMediaProps) {
  const content = (
    <>
      <img
        alt={`${exercise.name} demonstration`}
        className={cn("h-full w-full object-contain", imageClassName)}
        loading="lazy"
        src={exercise.gifUrl}
      />
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-[rgba(14,20,19,0.76)] px-2.5 py-1 font-mono text-[0.62rem] font-black uppercase text-white">
        GIF
      </span>
    </>
  );

  if (onOpen) {
    return (
      <button
        aria-label={`Open ${exercise.name} details`}
        className={cn(
          "relative block overflow-hidden rounded-[16px] border border-[var(--line)] bg-white text-left shadow-[inset_0_-10px_30px_rgba(14,20,19,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(14,20,19,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)]",
          className
        )}
        onClick={onOpen}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-[var(--line)] bg-white shadow-[inset_0_-10px_30px_rgba(14,20,19,0.04)]",
        className
      )}
    >
      {content}
    </div>
  );
}
