import React from "react";
import { Img, staticFile } from "remotion";
import { EASE, ramp } from "../lib/anim";
import { C, FONT } from "../lib/theme";

/** 用胶带贴在白板上的真实截图/文件面板。 */
export const Pin: React.FC<{
  src: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  fit?: "cover" | "contain";
  rotate?: number;
  enter?: number;
  label?: string;
  labelColor?: string;
  tape?: string;
  children?: React.ReactNode;
  z?: number;
}> = ({ src, x, y, width, height, fit = "contain", rotate = 0, enter = 1, label, labelColor = C.fg, tape = "rgba(255,216,106,.72)", children, z = 1 }) => {
  const e = ramp(enter, [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        transform: `translateY(${(1 - e) * 34}px) rotate(${rotate}deg) scale(${0.94 + e * 0.06})`,
        opacity: e,
        zIndex: z,
      }}
    >
      <div
        style={{
          background: C.paper,
          border: `4px solid ${C.fg}`,
          boxShadow: "12px 14px 0 rgba(35,48,59,.14)",
          padding: 10,
        }}
      >
        {height ? (
          <div style={{ width: "100%", height, background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit }} />
          </div>
        ) : (
          <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
        )}
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          left: -18,
          top: -17,
          width: width * 0.28,
          height: 30,
          background: tape,
          border: "1px solid rgba(190,160,70,.18)",
          transform: "rotate(-4deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -10,
          top: -13,
          width: width * 0.22,
          height: 28,
          background: tape,
          border: "1px solid rgba(190,160,70,.18)",
          transform: "rotate(5deg)",
        }}
      />
      {label ? (
        <div style={{ marginTop: 13, fontFamily: FONT.mono, fontSize: 19, letterSpacing: ".03em", color: labelColor, transform: `rotate(${rotate * -0.45}deg)` }}>
          {label}
        </div>
      ) : null}
    </div>
  );
};

export const Highlight: React.FC<{ children: React.ReactNode; color?: string; delay?: number; t: number }> = ({ children, color = C.yellow, delay = 0, t }) => {
  const p = ramp(t, [delay, delay + 0.35], [0, 1], EASE.out);
  return (
    <span style={{ position: "relative", display: "inline-block", isolation: "isolate" }}>
      <span
        style={{
          position: "absolute",
          left: -6,
          right: -8,
          bottom: 4,
          height: "34%",
          background: color,
          transform: `rotate(-1.2deg) scaleX(${p})`,
          transformOrigin: "left center",
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
