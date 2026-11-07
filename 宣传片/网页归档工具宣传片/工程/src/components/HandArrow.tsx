import React from "react";
import { C } from "../lib/theme";

/** 手绘箭头：用 strokeDashoffset 让线条逐段画出来。 */
export const HandArrow: React.FC<{
  d: string;
  width: number;
  height: number;
  progress: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  dashed?: boolean;
}> = ({ d, width, height, progress, color = C.red, strokeWidth = 7, style, dashed = false }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} fill="none">
    <path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={dashed ? "0.08 0.06" : "1"}
      strokeDashoffset={dashed ? 0 : 1 - Math.min(1, Math.max(0, progress))}
      opacity={dashed ? 0.75 : 1}
    />
  </svg>
);

/** 手绘圈：把一个区域圈起来。 */
export const HandCircle: React.FC<{ width: number; height: number; progress: number; color?: string }> = ({ width, height, progress, color = C.red }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" style={{ position: "absolute", inset: 0 }}>
    <path
      d={`M ${width * 0.12} ${height * 0.45} C ${width * 0.02} ${height * 0.08}, ${width * 0.82} ${height * 0.02}, ${width * 0.93} ${height * 0.34} C ${width * 1.03} ${height * 0.72}, ${width * 0.6} ${height * 0.98}, ${width * 0.28} ${height * 0.9} C ${width * 0.08} ${height * 0.84}, ${width * 0.04} ${height * 0.6}, ${width * 0.12} ${height * 0.45}`}
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1"
      strokeDashoffset={1 - Math.min(1, Math.max(0, progress))}
    />
  </svg>
);
