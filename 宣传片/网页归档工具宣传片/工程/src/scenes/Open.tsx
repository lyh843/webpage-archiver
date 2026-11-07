import React from "react";
import { Board } from "../components/Board";
import { HandArrow } from "../components/HandArrow";
import { Highlight, Pin } from "../components/Pin";
import { ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

const CARDS = [
  { src: "img/panel-md.jpg", label: "article.md", tag: "可检索", x: 842, rotate: -2.0, fit: "cover" as const },
  { src: "img/pdf-1.png", label: "article.pdf", tag: "可打印", x: 1170, rotate: 1.4, fit: "contain" as const },
  { src: "img/archive-top.jpg", label: "index.html", tag: "可离线", x: 1498, rotate: -1.1, fit: "cover" as const },
];

export const Open: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("open");
  if (t < s.start || t >= s.end) return null;
  const head = ramp(t, [0.0, 0.55]);
  const sub = ramp(t, [0.5, 1.1]);
  const note = ramp(t, [3.35, 4.0]);
  const bracket = ramp(t, [2.9, 3.5]);

  return (
    <Board note="ARCHIVE NOTES / 01">
      <div style={{ position: "absolute", left: 92, top: 172, width: 720, opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
        <div style={{ fontFamily: FONT.display, fontSize: 100, lineHeight: 1.18, letterSpacing: ".01em" }}>
          一篇文章，
          <br />
          <Highlight t={t} delay={0.72}>
            三种活法。
          </Highlight>
        </div>
        <div style={{ marginTop: 28, width: 650, fontSize: 29, lineHeight: 1.72, color: C.dim, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
          同一个链接，留下三份能用的档案：
          <br />
          可检索的 Markdown、可打印的 PDF、断网也能打开的 HTML。
        </div>
      </div>

      <div style={{ position: "absolute", left: 828, top: 222, width: 994, height: 360, border: `4px dashed rgba(60,125,217,${0.3 * bracket})`, opacity: bracket, transform: "rotate(-.4deg)" }} />

      {CARDS.map((c, i) => {
        const enter = ramp(t, [0.5 + i * 0.72, 1.1 + i * 0.72]);
        return (
          <React.Fragment key={c.label}>
            <Pin src={c.src} x={c.x} y={242} width={296} height={300} fit={c.fit} rotate={c.rotate} enter={enter} label={c.label} z={2 + i} />
            <div
              style={{
                position: "absolute",
                left: c.x + 6,
                top: 624,
                background: C.yellow,
                border: `2px solid ${C.fg}`,
                padding: "4px 10px",
                fontFamily: FONT.display,
                fontSize: 22,
                opacity: enter,
                transform: `rotate(${c.rotate * -0.6}deg)`,
              }}
            >
              {c.tag}
            </div>
          </React.Fragment>
        );
      })}

      <HandArrow d="M 760 520 C 790 560, 800 600, 832 612" width={100} height={110} progress={bracket} color={C.accent} style={{ position: "absolute", left: 740, top: 500 }} />
      <div style={{ position: "absolute", left: 94, top: 690, fontFamily: FONT.display, fontSize: 35, color: C.accent, opacity: note, transform: "rotate(-1deg)" }}>
        同一篇原文，三个可以直接用的文件。
      </div>

      <div style={{ position: "absolute", left: 94, bottom: 98, fontFamily: FONT.mono, fontSize: 15, color: C.faint, opacity: note, letterSpacing: ".02em" }}>
        演示原文 · lilianweng.github.io / LLM Powered Autonomous Agents
      </div>
    </Board>
  );
};
