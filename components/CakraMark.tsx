/**
 * cakra logo — a house built from seven jigsaw pieces (roof + a 2×3 body grid),
 * each one of the seven brand colours, joined by white puzzle seams and knobs.
 */
const P = {
  red: "#D6452C",
  orange: "#E5672B",
  gold: "#E0A31F",
  green: "#4C9E42",
  teal: "#2B8296",
  blue: "#3C4FA6",
  purple: "#7C3FA0",
};

export function CakraMark({ size = 30, className }: { size?: number; className?: string; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="cakra">
      <g stroke="#ffffff" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
        {/* roof */}
        <polygon points="50,4 94,46 6,46" fill={P.red} />
        {/* body — row 1 */}
        <rect x="15" y="46" width="35" height="16.33" fill={P.orange} />
        <rect x="50" y="46" width="35" height="16.33" fill={P.gold} />
        {/* body — row 2 */}
        <rect x="15" y="62.33" width="35" height="16.34" fill={P.green} />
        <rect x="50" y="62.33" width="35" height="16.34" fill={P.teal} />
        {/* body — row 3 (rounded bottom corners) */}
        <path d="M15 78.67 H50 V95 H20 Q15 95 15 90 Z" fill={P.blue} />
        <path d="M50 78.67 H85 V90 Q85 95 80 95 H50 Z" fill={P.purple} />
        {/* puzzle knobs on the seams */}
        <circle cx="50" cy="54.2" r="3" fill={P.gold} />
        <circle cx="50" cy="70.5" r="3" fill={P.green} />
        <circle cx="50" cy="86.8" r="3" fill={P.purple} />
        <circle cx="32.5" cy="62.33" r="3" fill={P.orange} />
        <circle cx="67.5" cy="78.67" r="3" fill={P.teal} />
      </g>
    </svg>
  );
}
