import React from "react";
import { Img, staticFile } from "remotion";
import { C, FONT } from "../lib/theme";

/** 白板风格的真实浏览器窗口。 */
export const PaperBrowser: React.FC<{
  width: number;
  height: number;
  url: string;
  src?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, url, src, children, style }) => {
  const bar = 46;
  return (
    <div
      style={{
        width,
        height,
        background: C.paper,
        border: `5px solid ${C.fg}`,
        boxShadow: "14px 16px 0 rgba(35,48,59,.15)",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div style={{ height: bar, borderBottom: `4px solid ${C.fg}`, display: "flex", alignItems: "center", gap: 9, padding: "0 16px" }}>
        {["#D1493C", "#FFD86A", "#2E7D5B"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c, border: `2px solid ${C.fg}` }} />
        ))}
        <div
          style={{
            marginLeft: 10,
            flex: 1,
            borderBottom: `3px solid ${C.faint}`,
            fontFamily: FONT.mono,
            fontSize: 14,
            color: C.dim,
            paddingBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ position: "relative", width: "100%", height: height - bar, overflow: "hidden", background: "#fff" }}>
        {src ? <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} /> : null}
        {children}
      </div>
    </div>
  );
};
