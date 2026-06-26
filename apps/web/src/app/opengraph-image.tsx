import { ImageResponse } from "next/og";

// Branded social-share card, inherited by every page (Next file convention adds
// og:image + twitter:image automatically). 1200×630, default-font Latin only.
export const alt = "XRPL AI Hub — the live index of agentic payments on the XRP Ledger";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0A0A0A",
          backgroundImage:
            "radial-gradient(900px 600px at 0% 0%, rgba(0,140,255,0.22), transparent 60%), radial-gradient(800px 600px at 100% 100%, rgba(201,70,46,0.18), transparent 55%)",
          color: "#F5F3F0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ display: "flex", width: "52px", height: "52px", borderRadius: "999px", backgroundColor: "#FFFFFF" }} />
          <div style={{ display: "flex", fontSize: "30px", letterSpacing: "3px", color: "#F5F3F0" }}>XRPL · AI HUB</div>
        </div>

        <div style={{ display: "flex", fontSize: "68px", fontWeight: 600, lineHeight: 1.04, letterSpacing: "-2px", maxWidth: "960px" }}>
          The live index of agentic payments on the XRP Ledger
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "26px", color: "#A8A29E" }}>
          <div style={{ display: "flex", width: "12px", height: "12px", borderRadius: "999px", backgroundColor: "#C9462E" }} />
          <div style={{ display: "flex" }}>xrpl-ai.org · RLUSD · XRP · x402</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
