import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Formixa — AI DS-160 Visa Form Assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#3b5bdb",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em", marginBottom: 24 }}>
          DS-160 FORM ASSISTANT
        </div>
        <div style={{ fontSize: 80, fontWeight: 700, color: "white", lineHeight: 1.1, textAlign: "center" }}>
          Formixa
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.85)", marginTop: 24, textAlign: "center" }}>
          Fill Your US Visa Form in Minutes with AI
        </div>
        <div
          style={{
            marginTop: 40,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 32px",
            fontSize: 22,
            color: "white",
          }}
        >
          $25 · Instant PDF · No account needed
        </div>
      </div>
    ),
    { ...size },
  );
}
