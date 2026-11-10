import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = site.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08071a",
          color: "#efeaf8",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a29cc6",
          }}
        >
          <span>AX1S_TEAM</span>
          <span>весна 2027</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: -2,
              lineHeight: 0.95,
            }}
          >
            <span>Форма врёт.</span>
            <span>Бренд остаётся.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 22,
              color: "#a29cc6",
            }}
          >
            Иммерсивные 3D-сайты. WebGL как носитель идентичности.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", width: 48, height: 4, background: "#a98bff" }} />
          <div style={{ display: "flex", width: 48, height: 4, background: "#3fe0c5" }} />
          <div style={{ display: "flex", width: 48, height: 4, background: "#ff7a68" }} />
          <div style={{ display: "flex", width: 48, height: 4, background: "#f4c55a" }} />
          <div style={{ display: "flex", width: 48, height: 4, background: "#ff5c93" }} />
        </div>
      </div>
    ),
    size,
  );
}
