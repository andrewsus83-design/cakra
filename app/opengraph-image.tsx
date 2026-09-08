import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "cakra — kehadiran digital untuk agen properti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHAKRA = ["#B0503A", "#C67B2E", "#C9A227", "#5E8850", "#357482", "#3A5AA8", "#6F5285"];

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #F7F2E9 0%, #EFE7D6 100%)",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
          color: "#211A11",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {CHAKRA.map((c) => (
            <div key={c} style={{ width: 26, height: 26, borderRadius: 8, background: c }} />
          ))}
          <div style={{ marginLeft: 14, fontSize: 40, fontWeight: 700, color: "#A9762B" }}>cakra</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 30, color: "#A9762B", letterSpacing: 1 }}>Kehadiran digital untuk agen properti</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, maxWidth: 940 }}>
            Jadilah agen yang tak bisa diabaikan AI.
          </div>
          <div style={{ fontSize: 30, color: "#4A3E2C", maxWidth: 900 }}>
            Website, listing, konten &amp; video AI, dan Skor Cakra — dalam satu roda.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#6B5C44" }}>
          <span>cakra.xyz</span>
          <span>Ditemukan di Google, AI, &amp; sosial</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
