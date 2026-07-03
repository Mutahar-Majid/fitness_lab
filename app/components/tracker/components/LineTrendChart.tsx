import { cn } from "@/lib/utils";

interface LineTrendPoint {
  label: string;
  value: number;
}

interface LineTrendChartProps {
  points: LineTrendPoint[];
  className?: string;
  tone?: "green" | "lavender";
}

export function LineTrendChart({
  points,
  className,
  tone = "green",
}: LineTrendChartProps) {
  const width = 360;
  const height = 150;
  const paddingX = 18;
  const paddingY = 18;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const range = Math.max(maxValue - minValue, 1);
  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((point.value - minValue) / range) * (height - paddingY * 2);

    return { ...point, x, y };
  });
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const accent = tone === "lavender" ? "#745bd6" : "var(--signal-green)";
  const shadow = tone === "lavender" ? "#bda7ff" : "var(--steel-blue)";

  return (
    <div className={cn("rounded-[14px] bg-[var(--surface-rail)] p-3", className)}>
      <svg
        aria-label="Line trend chart"
        className="h-40 w-full overflow-visible"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          stroke="rgba(14,20,19,0.12)"
          strokeDasharray="4 6"
          x1={paddingX}
          x2={width - paddingX}
          y1={height - paddingY}
          y2={height - paddingY}
        />
        <polyline
          fill="none"
          points={line}
          stroke={shadow}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
          opacity="0.22"
        />
        <polyline
          fill="none"
          points={line}
          stroke={accent}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
        {coordinates.map((point) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              fill="var(--surface-panel)"
              r="5.5"
              stroke={accent}
              strokeWidth="3"
            />
            <text
              fill="var(--muted)"
              fontFamily="monospace"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              x={point.x}
              y={height - 2}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
