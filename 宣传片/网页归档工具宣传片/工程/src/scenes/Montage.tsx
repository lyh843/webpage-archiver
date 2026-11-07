import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Board } from "../components/Board";
import { EASE, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

const SHOTS = [
  { src: "img/archive-code.jpg", label: "Markdown / 代码块" },
  { src: "img/archive-chart.jpg", label: "图表 / 数据" },
  { src: "img/archive-mips.jpg", label: "公式 / 推导" },
  { src: "img/pdf-4.png", label: "PDF / 图文同页" },
  { src: "img/pdf-11.png", label: "PDF / 长图分页" },
  { src: "img/panel-md.jpg", label: "Markdown / 可检索" },
  { src: "img/panel-files.jpg", label: "文件清单 / 可复核" },
  { src: "img/panel-verify.jpg", label: "校验 / 0 错误" },
];

export const Montage: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("montage");
  if (t < s.start || t >= s.end) return null;
  const cut = 0.62;
  const idx = Math.min(SHOTS.length - 1, Math.floor((t - s.start) / cut));
  const local = (t - s.start) - idx * cut;
  const shot = SHOTS[idx];
  const p = ramp(local, [0, cut], [0, 1], EASE.linear);
  const overlay = ramp(t, [36.0, 36.5]);

  return (
    <Board note="ARCHIVE NOTES / 07">
      <AbsoluteFill style={{ padding: 56 }}>
        <div
          style={{
            position: "absolute",
            inset: 56,
            background: C.paper,
            border: `5px solid ${C.fg}`,
            boxShadow: "14px 16px 0 rgba(35,48,59,.15)",
            overflow: "hidden",
            transform: `rotate(${idx % 2 === 0 ? -0.35 : 0.35}deg)`,
          }}
        >
          <Img
            src={staticFile(shot.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transform: `scale(${1.04 + p * 0.05}) translateX(${(idx % 2 === 0 ? 1 : -1) * p * 12}px)`,
            }}
          />
          <div style={{ position: "absolute", left: 26, bottom: 24, background: C.yellow, border: `3px solid ${C.fg}`, padding: "9px 16px", fontFamily: FONT.mono, fontSize: 19 }}>
            {shot.label}
          </div>
          <div style={{ position: "absolute", right: 30, bottom: 26, fontFamily: FONT.mono, fontSize: 17, color: C.dim }}>
            {String(idx + 1).padStart(2, "0")} / {String(SHOTS.length).padStart(2, "0")}
          </div>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 92,
          opacity: overlay,
          transform: `rotate(-2deg) translateY(${(1 - overlay) * 16}px)`,
          background: C.yellow,
          border: `4px solid ${C.fg}`,
          padding: "12px 22px",
          fontFamily: FONT.display,
          fontSize: 52,
          boxShadow: "7px 8px 0 rgba(35,48,59,.14)",
        }}
      >
        9 类交付文件，一次生成。
      </div>
    </Board>
  );
};
