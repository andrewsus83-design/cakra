import type { ReactNode } from "react";

/** Centered section header: a handwritten kicker (Caveat) over a bold Newsreader title. */
export function SectionTitle({
  hand,
  children,
  max = "24ch",
}: {
  hand: string;
  children: ReactNode;
  max?: string;
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: "44rem", margin: "0 auto 48px" }}>
      <span className="hand gold" style={{ fontSize: "1.75rem", lineHeight: 1, display: "inline-block", transform: "rotate(-2deg)" }}>
        {hand}
      </span>
      <h2
        className="display"
        style={{ fontWeight: 700, fontSize: "clamp(2.2rem, 4.4vw, 3.4rem)", margin: "8px auto 0", maxWidth: max, lineHeight: 1.03 }}
      >
        {children}
      </h2>
    </div>
  );
}
