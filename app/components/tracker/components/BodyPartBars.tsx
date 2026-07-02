import {
  bodyPartLabels,
  bodyPartOrder,
} from "@/lib/domain/analytics";
import type { BodyPart } from "@/lib/domain/types";

interface BodyPartBarsProps {
  coverage: Record<BodyPart, number>;
}

export function BodyPartBars({ coverage }: BodyPartBarsProps) {
  const max = Math.max(1, ...Object.values(coverage));
  return (
    <div className="mt-5 space-y-3">
      {bodyPartOrder.map((part) => (
        <div key={part}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{bodyPartLabels[part]}</span>
            <span className="opacity-60">{coverage[part]} sets</span>
          </div>
          <div className="h-2 rounded-full bg-current/10">
            <div
              className="h-2 rounded-full bg-[var(--signal-green)]"
              style={{ width: `${Math.max(8, (coverage[part] / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
