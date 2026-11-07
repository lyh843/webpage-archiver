import React from "react";
import { Img, staticFile } from "remotion";
import { Board } from "../components/Board";
import { HandArrow } from "../components/HandArrow";

import { PaperBrowser } from "../components/PaperBrowser";
import { keys, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

const CALLOUTS = [
  { y: 196, title: "图片本地化", sub: "assets/ · 13 个文件", color: C.accent },
  { y: 382, title: "公式 SVG 冻结", sub: "16 处数学 · 0 个报错", color: C.red },
  { y: 568, title: "断网可读", sub: "offlineRemoteRequests: []", color: C.green },
];

export const HtmlScene: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("html");
  if (t < s.start || t >= s.end) return null;
  const title = 1;
  const titleSlide = ramp(t, [s.start, s.start + 0.4]);
  const browser = 1;
  const browserSlide = ramp(t, [s.start, s.start + 0.45]);
  const top = keys(t, [0, 17.25, 17.55, 19.55, 19.85], [1, 1, 0, 0, 0]);
  const chart = keys(t, [17.25, 17.65, 19.55, 19.9], [0, 1, 1, 0]);
  const code = keys(t, [19.55, 19.95, 22.45, 22.56], [0, 1, 1, 0]);
  const green = ramp(t, [20.4, 20.9], [0, 1]);

  return (
    <Board note="ARCHIVE NOTES / 04">
      <div style={{ position: "absolute", left: 92, top: 92, fontFamily: FONT.display, fontSize: 58, opacity: title, transform: `translateY(${(1 - titleSlide) * 14}px)` }}>
        真实页面，完整搬走。
      </div>
      <div style={{ position: "absolute", left: 94, top: 164, fontSize: 24, color: C.dim, opacity: title }}>不是重新排版，是原站内容与资源一起落到本地。</div>

      <div style={{ position: "absolute", left: 90, top: 218, opacity: browser, transform: `translateY(${(1 - browserSlide) * 18}px) scale(${0.98 + browserSlide * 0.02})` }}>
        <PaperBrowser width={1036} height={604} url="lilianweng.github.io/posts/2023-06-23-agent/">
          <Img src={staticFile("img/archive-top.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: top }} />
          <Img src={staticFile("img/archive-chart.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: chart }} />
          <Img src={staticFile("img/archive-code.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: code }} />
        </PaperBrowser>
      </div>

      {CALLOUTS.map((c, i) => {
        const p = ramp(t, [15.45 + i * 1.75, 15.95 + i * 1.75], [0, 1], undefined);
        return (
          <div key={c.title} style={{ position: "absolute", left: 1208, top: c.y, width: 620, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 16, height: 16, borderRadius: 99, background: c.color, border: `3px solid ${C.fg}` }} />
              <span style={{ fontFamily: FONT.display, fontSize: 38 }}>{c.title}</span>
            </div>
            <div style={{ marginTop: 8, marginLeft: 32, fontFamily: FONT.mono, fontSize: 17, color: C.dim }}>{c.sub}</div>
          </div>
        );
      })}

      <HandArrow d="M 1196 238 C 1160 246, 1148 270, 1148 300" width={80} height={110} progress={ramp(t, [15.9, 16.4])} color={C.accent} style={{ position: "absolute", left: 1120, top: 210 }} />
      <HandArrow d="M 1196 424 C 1158 432, 1144 470, 1148 505" width={80} height={120} progress={ramp(t, [17.6, 18.1])} color={C.red} style={{ position: "absolute", left: 1120, top: 402 }} />
      <HandArrow d="M 1196 610 C 1158 618, 1146 650, 1150 680" width={80} height={110} progress={ramp(t, [19.4, 19.9])} color={C.green} style={{ position: "absolute", left: 1120, top: 590 }} />

      <div
        style={{
          position: "absolute",
          left: 92,
          bottom: 86,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: green,
          transform: `rotate(-1deg) translateY(${(1 - green) * 14}px)`,
        }}
      >
        <div style={{ background: C.green, color: "#fff", fontFamily: FONT.mono, fontSize: 20, padding: "12px 18px" }}>✓ OFFLINE</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.dim }}>全程 0 个外部资源请求 · 图片 / 公式 / 字体均已本地化</div>
      </div>
    </Board>
  );
};
