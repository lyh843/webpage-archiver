import React from "react";
import { Board } from "../components/Board";
import { Pin } from "../components/Pin";
import { EASE, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

export const MdScene: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("md");
  if (t < s.start || t >= s.end) return null;
  const title = 1;
  const titleSlide = ramp(t, [s.start, s.start + 0.4]);
  const a = 1;
  const b = ramp(t, [s.start + 1.0, s.start + 1.65]);
  const c = ramp(t, [s.start + 1.8, s.start + 2.45]);
  const stamp = ramp(t, [s.start + 2.9, s.start + 3.4], [0, 1], EASE.back);

  return (
    <Board note="ARCHIVE NOTES / 06">
      <div style={{ position: "absolute", left: 90, top: 80, fontFamily: FONT.display, fontSize: 48, opacity: title, transform: `translateY(${(1 - titleSlide) * 12}px)` }}>
        可检索、可引用、可复核。
      </div>

      <Pin src="img/panel-md.jpg" x={78} y={168} width={972} rotate={-1.1} enter={a} label="article.md · 原文保留" z={2} />
      <Pin src="img/panel-verify.jpg" x={1100} y={156} width={700} rotate={1.2} enter={b} label="verification.json · 自动校验" z={3} />
      <Pin src="img/panel-files.jpg" x={1100} y={572} width={700} rotate={-0.8} enter={c} label="一份完整的交付目录" z={4} />

      <div
        style={{
          position: "absolute",
          left: 1112,
          top: 420,
          display: "flex",
          gap: 10,
          opacity: stamp,
          transform: `rotate(-5deg) scale(${0.8 + stamp * 0.2})`,
          transformOrigin: "left center",
        }}
      >
        <div style={{ border: `4px solid ${C.green}`, color: C.green, padding: "8px 14px", fontFamily: FONT.mono, fontSize: 18, letterSpacing: ".08em" }}>0 ERRORS</div>
      </div>

      <div style={{ position: "absolute", left: 94, bottom: 86, display: "flex", gap: 12, opacity: c }}>
        {["metadata.csl.json", "citation.bib", "manifest.json"].map((x) => (
          <div key={x} style={{ background: C.paper, border: `3px solid ${C.fg}`, padding: "10px 14px", fontFamily: FONT.mono, fontSize: 16, boxShadow: "4px 5px 0 rgba(35,48,59,.10)" }}>
            {x}
          </div>
        ))}
      </div>
    </Board>
  );
};
