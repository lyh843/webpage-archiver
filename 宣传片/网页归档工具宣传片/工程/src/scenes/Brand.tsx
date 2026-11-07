import React from "react";
import { Board } from "../components/Board";
import { HandArrow } from "../components/HandArrow";
import { Pin } from "../components/Pin";
import { EASE, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

export const Brand: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("brand");
  if (t < s.start || t >= s.end) return null;
  const boom = ramp(t, [10.33, 10.5], [0, 1], EASE.out);
  const name = 1;
  const nameScale = ramp(t, [10.033, 10.33], [1.05, 1], EASE.out);
  const sub = ramp(t, [10.9, 11.5]);
  const term = ramp(t, [10.05, 10.65]);
  const arrow = ramp(t, [11.3, 11.9]);
  const chips = ramp(t, [12.2, 12.9]);
  const stamp = ramp(t, [12.1, 12.6], [0, 1], EASE.back);
  const url = ramp(t, [13.1, 13.8]);

  return (
    <Board note="ARCHIVE NOTES / 03">
      <div
        style={{
          position: "absolute",
          left: 660,
          top: 240,
          width: 700,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,216,106,.42), rgba(255,216,106,0) 68%)",
          opacity: boom,
          filter: "blur(6px)",
        }}
      />
      <div style={{ position: "absolute", left: 88, top: 146, width: 820, transform: `translateY(${(1 - nameScale) * 26}px) scale(${nameScale})`, opacity: name, transformOrigin: "left center" }}>
        <div style={{ fontFamily: FONT.display, fontSize: 104, lineHeight: 1.08, letterSpacing: "-.01em" }}>
          webpage-
          <br />
          <span style={{ color: C.accent }}>archiver</span>
        </div>
        <div style={{ marginTop: 22, fontFamily: FONT.display, fontSize: 43, color: C.fg }}>网页归档工具</div>
        <div style={{ marginTop: 18, fontSize: 29, lineHeight: 1.7, color: C.dim, opacity: sub }}>
          把在线文章，变成能带走的档案。
          <br />
          不是收藏一个链接，是保存整篇原文。
        </div>
      </div>

      <Pin src="img/panel-terminal.jpg" x={900} y={178} width={896} rotate={1.4} enter={term} label="一条命令，跑完整个归档" z={4} />
      <HandArrow d="M 800 540 C 840 500, 880 500, 920 530" width={160} height={110} progress={arrow} style={{ position: "absolute", left: 760, top: 470 }} />
      <div style={{ position: "absolute", left: 690, top: 600, fontFamily: FONT.display, fontSize: 32, color: C.red, transform: "rotate(-4deg)", opacity: arrow }}>一条命令</div>

      <div style={{ position: "absolute", left: 96, top: 660, display: "flex", gap: 14, opacity: chips, transform: `translateY(${(1 - chips) * 16}px)` }}>
        {["article.md", "article.pdf", "index.html"].map((x) => (
          <div key={x} style={{ background: C.paper, border: `3px solid ${C.fg}`, padding: "12px 16px", fontFamily: FONT.mono, fontSize: 19, boxShadow: "5px 6px 0 rgba(35,48,59,.12)" }}>
            {x}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 790,
          transform: `rotate(-12deg) scale(${0.7 + stamp * 0.3})`,
          opacity: stamp,
          border: `7px solid ${C.red}`,
          color: C.red,
          width: 178,
          height: 178,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontSize: 40,
          letterSpacing: ".08em",
        }}
      >
        ETM
      </div>

      <div style={{ position: "absolute", right: 94, bottom: 100, fontFamily: FONT.mono, fontSize: 15, color: C.faint, opacity: url, letterSpacing: ".02em" }}>
        github.com/lyh843/webpage-archiver
      </div>
    </Board>
  );
};
