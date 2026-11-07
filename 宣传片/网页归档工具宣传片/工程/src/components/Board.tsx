import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../lib/theme";

/** 白板底：纸纹、网格点、边框、胶带和角标。所有场景共用。 */
export const Board: React.FC<{ children?: React.ReactNode; note?: string }> = ({ children, note = "ARCHIVE NOTES / 01" }) => {
  return (
    <AbsoluteFill style={{ background: C.bg, color: C.fg, fontFamily: FONT.body, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: 0.55,
          backgroundImage: "radial-gradient(#C9D4CE 1.25px, transparent 1.35px)",
          backgroundSize: "27px 27px",
        }}
      />
      <div style={{ position: "absolute", inset: 30, border: `3px solid ${C.line}`, borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 64, top: 48, display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={{ fontFamily: FONT.display, fontSize: 27, letterSpacing: ".02em" }}>webpage-archiver</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: ".18em", color: C.faint }}>ETM</span>
      </div>
      <div style={{ position: "absolute", right: 64, top: 54, fontFamily: FONT.mono, fontSize: 13, letterSpacing: ".18em", color: C.faint }}>
        {note}
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 24,
          width: 150,
          height: 38,
          background: "rgba(255,216,106,.62)",
          border: "1px solid rgba(190,160,70,.28)",
          transform: "rotate(-4deg)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 170,
          top: 18,
          width: 130,
          height: 34,
          background: "rgba(255,216,106,.48)",
          border: "1px solid rgba(190,160,70,.22)",
          transform: "rotate(5deg)",
          opacity: 0.85,
        }}
      />
      {children}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: "inset 0 0 180px rgba(70,55,30,.10)",
        }}
      />
    </AbsoluteFill>
  );
};
