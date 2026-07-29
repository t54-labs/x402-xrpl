import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Branded social-share card, inherited by every page. Matches the homepage hero,
// in the t54 brand faces: Youth Trial (headline) + Foundry Plek (label/footer).
export const alt = "Build the agent economy on XRP Ledger together — XRPL AI Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fonts = join(process.cwd(), "public", "fonts");
  const [youth, plek] = await Promise.all([
    readFile(join(fonts, "Youth-Medium.otf")),
    readFile(join(fonts, "FoundryPlek-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 72px",
          backgroundColor: "#0A0A0A",
          backgroundImage:
            "radial-gradient(900px 600px at 0% 0%, rgba(0,140,255,0.22), transparent 60%), radial-gradient(800px 600px at 100% 100%, rgba(201,70,46,0.18), transparent 55%)",
          color: "#F5F3F0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontFamily: "Foundry Plek" }}>
          <div style={{ display: "flex", width: "50px", height: "50px", borderRadius: "999px", backgroundColor: "#FFFFFF" }} />
          <div style={{ display: "flex", fontSize: "29px", letterSpacing: "4px", color: "#F5F3F0" }}>XRPL · AI HUB</div>
        </div>

        <div style={{ display: "flex", fontFamily: "Youth Trial", fontSize: "82px", lineHeight: 1.05, letterSpacing: "-2px", maxWidth: "1010px" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <span style={{ color: "#F5F3F0" }}>Build the agent economy on XRP Ledger&nbsp;</span>
            <span style={{ color: "#C9462E" }}>together</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "Foundry Plek", fontSize: "25px", color: "#A8A29E" }}>
          <div style={{ display: "flex", width: "12px", height: "12px", borderRadius: "999px", backgroundColor: "#C9462E" }} />
          <div style={{ display: "flex" }}>xrpl-ai.org · RLUSD · XRP · x402</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Youth Trial", data: youth, weight: 500, style: "normal" },
        { name: "Foundry Plek", data: plek, weight: 500, style: "normal" },
      ],
    }
  );
}
