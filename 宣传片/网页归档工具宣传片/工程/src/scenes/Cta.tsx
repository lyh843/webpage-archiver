import React from "react";
import { Board } from "../components/Board";
import { Highlight } from "../components/Pin";
import { EASE, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

export const Cta: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("cta");
  if (t < s.start || t >= s.end) return null;
  const name = 1;
  const nameSlide = ramp(t, [s.start, s.start + 0.4]);
  const tag = 1;
  const tagSlide = ramp(t, [s.start + 0.05, s.start + 0.45]);
  const url = ramp(t, [s.start + 1.25, s.start + 1.85], [0, 1], EASE.out);
  const chips = ramp(t, [s.start + 1.9, s.start + 2.5]);
  const zotero = ramp(t, [s.start + 2.5, s.start + 3.0]);
  const stamp = ramp(t, [s.start + 5.2, s.start + 5.75], [0, 1], EASE.back);

  return (
    <Board note="ARCHIVE NOTES / 08">
      <div style={{ position: "absolute", left: 112, top: 100, fontFamily: FONT.display, fontSize: 98, lineHeight: 1.08, opacity: name, transform: `translateY(${(1 - nameSlide) * 18}px)` }}>
        webpage-<span style={{ color: C.accent }}>archiver</span>
      </div>

      <div style={{ position: "absolute", left: 116, top: 248, fontFamily: FONT.display, fontSize: 68, lineHeight: 1.26, opacity: tag, transform: `translateY(${(1 - tagSlide) * 16}px)` }}>
        把值得留下的网页，
        <br />
        <Highlight t={t} delay={s.start + 0.9} color={C.yellow}>
          留在本地。
        </Highlight>
      </div>

      <div
        style={{
          position: "absolute",
          left: 112,
          top: 470,
          width: 1420,
          height: 124,
          border: `5px solid ${C.fg}`,
          background: C.paper,
          boxShadow: "10px 12px 0 rgba(35,48,59,.14)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          opacity: url,
          transform: `translateX(${(1 - url) * -30}px) rotate(-.5deg)`,
        }}
      >
        <span style={{ fontFamily: FONT.mono, fontSize: 48, color: C.fg, letterSpacing: "-.01em" }}>github.com/lyh843/webpage-archiver</span>
        <span style={{ marginLeft: "auto", fontFamily: FONT.display, fontSize: 28, color: C.accent }}>→</span>
      </div>

      <div style={{ position: "absolute", left: 116, top: 640, display: "flex", gap: 14, opacity: chips, transform: `translateY(${(1 - chips) * 14}px)` }}>
        {["Markdown", "PDF", "Offline HTML"].map((x) => (
          <div key={x} style={{ background: C.paper, border: `3px solid ${C.fg}`, padding: "11px 16px", fontFamily: FONT.mono, fontSize: 19, boxShadow: "5px 6px 0 rgba(35,48,59,.10)" }}>
            {x}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 116, top: 742, fontSize: 28, color: C.dim, opacity: zotero }}>
        可选：通过 Zotero MCP 查重、导入，再读回核验。
      </div>

      <div style={{ position: "absolute", left: 116, bottom: 92, fontFamily: FONT.mono, fontSize: 15, color: C.faint, letterSpacing: ".08em" }}>
        EVERY ARTICLE, KEPT.
      </div>

      <div
        style={{
          position: "absolute",
          right: 116,
          bottom: 150,
          width: 210,
          height: 210,
          border: `8px solid ${C.red}`,
          borderRadius: 99,
          color: C.red,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(-13deg) scale(${0.7 + stamp * 0.3})`,
          opacity: stamp,
          fontFamily: FONT.display,
        }}
      >
        <span style={{ fontSize: 52, letterSpacing: ".08em" }}>ETM</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: ".16em", marginTop: 4 }}>ARCHIVED</span>
      </div>
    </Board>
  );
};
