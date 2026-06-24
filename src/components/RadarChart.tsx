import { CurriculumSkill } from '../types';

interface RadarChartProps {
  skillsList: CurriculumSkill[];
  studentSkills: Record<string, number>;
  size?: number;
}

export default function RadarChart({ skillsList, studentSkills, size = 300 }: RadarChartProps) {
  // Center coordinates
  const center = size / 2;
  const maxRadius = (size / 2) * 0.72; // Leave margin for labels
  const scoreMax = 5;

  // Use either the standard 16 skills or fallback
  const skillsToDraw = skillsList.length > 0 ? skillsList : [];
  const numPoints = skillsToDraw.length;

  // Generate radial guidelines and polygons
  const points = skillsToDraw.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const score = studentSkills[skill.name] || 1; // Default minimum rating is 1
    const radius = (score / scoreMax) * maxRadius;

    // Outer polygon limit coordinate (Standard Scale 5)
    const limitX = center + maxRadius * Math.cos(angle);
    const limitY = center + maxRadius * Math.sin(angle);

    // Actual user score coordinate
    const scoreX = center + radius * Math.cos(angle);
    const scoreY = center + radius * Math.sin(angle);

    return {
      name: skill.name,
      score,
      limitX,
      limitY,
      scoreX,
      scoreY,
      angle,
    };
  });

  const polygonsPointsString = points.map(p => `${p.scoreX},${p.scoreY}`).join(' ');

  // Standard guideline rings (Levels 1 to 5)
  const rings = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-4 border border-zinc-100 dark:border-zinc-900 rounded-3xl shadow-sm" id="radar-chart-container">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Radial guidelines Grid */}
          {rings.map((ring, i) => {
            const ringRadius = (ring / scoreMax) * maxRadius;
            const ringPoints = skillsToDraw.map((_, index) => {
              const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
              const ringX = center + ringRadius * Math.cos(angle);
              const ringY = center + ringRadius * Math.sin(angle);
              return `${ringX},${ringY}`;
            }).join(' ');

            return (
              <polygon
                key={i}
                points={ringPoints}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-200 dark:text-zinc-800"
                strokeDasharray={ring !== 5 ? "3 3" : "none"}
              />
            );
          })}

          {/* Lines radiating from center to vertex limits */}
          {points.map((p, index) => (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={p.limitX}
              y2={p.limitY}
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-200 dark:text-zinc-800"
            />
          ))}

          {/* Concentric circles labels for scale */}
          {rings.map((ring) => {
            const labelY = center - (ring / scoreMax) * maxRadius;
            return (
              <text
                key={ring}
                x={center + 5}
                y={labelY + 4}
                fontSize="9"
                className="fill-zinc-400 dark:fill-zinc-600 font-mono select-none"
              >
                {ring}
              </text>
            );
          })}

          {/* Solid Colored filled polygon for the actual student stats */}
          {points.length > 0 && (
            <polygon
              points={polygonsPointsString}
              fill="rgba(244, 63, 94, 0.25)" // rose-500 opacity
              stroke="#f43f5e" // rose-500
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
          )}

          {/* Dots on score coordinates */}
          {points.map((p, index) => (
            <circle
              key={index}
              cx={p.scoreX}
              cy={p.scoreY}
              r="4"
              className="fill-rose-600 dark:fill-rose-400 stroke-white dark:stroke-zinc-950 stroke-2 transition-all duration-500 cursor-pointer"
              title={`${p.name}: ${p.score}/5`}
            />
          ))}

          {/* Captions & Attributes Labels */}
          {points.map((p, index) => {
            // Push labels slightly outwards to avoid overlaying on dots
            const labelRadius = maxRadius + 18;
            const labelX = center + labelRadius * Math.cos(p.angle);
            const labelY = center + labelRadius * Math.sin(p.angle);

            // Text alignment helper
            let textAnchor = "middle";
            if (Math.cos(p.angle) > 0.15) {
              textAnchor = "start";
            } else if (Math.cos(p.angle) < -0.15) {
              textAnchor = "end";
            }

            return (
              <text
                key={index}
                x={labelX}
                y={labelY + 3}
                textAnchor={textAnchor}
                fontSize="10"
                fontWeight="500"
                className="fill-zinc-700 dark:fill-zinc-300 font-sans select-none"
              >
                {p.name}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-4 mt-1 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-500/30 border border-rose-500 rounded-sm"></span>
          <span>Current Level Radar Grid</span>
        </div>
        <div>
          <span>Scale: 1 (Unformed) - 5 (Combat Weapon)</span>
        </div>
      </div>
    </div>
  );
}
