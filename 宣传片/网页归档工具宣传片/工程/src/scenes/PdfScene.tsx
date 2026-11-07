import React from "react";
import { Img, staticFile } from "remotion";
import { Board } from "../components/Board";
import { EASE, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

const PAGES = [
  { at: 22.57, src: "img/pdf-1.png", n: 1 },
  { at: 23.65, src: "img/pdf-4.png", n: 4 },
  { at: 25.05, src: "img/pdf-11.png", n: 11 },
  { at: 26.25, src: "img/pdf-17.png", n: 17 },
];

export const PdfScene: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("pdf");
  if (t < s.start || t >= s.end) return null;
  const title = 1;
  const titleSlide = ramp(t, [s.start, s.start + 0.4]);
  const stack = 1;
  const stackSlide = ramp(t, [s.start, s.start + 0.45]);
  const active = PAGES.reduce((acc, p, i) => (t >= p.at ? i : acc), 0);
  const page = PAGES[active];
  const local = t - page.at;
  const flip = ramp(local, [0, 0.5], [0, 1], EASE.out);
  const badge = ramp(t, [24.1, 24.7]);

  return (
    <Board note="ARCHIVE NOTES / 05">
      <div style={{ position: "absolute", left: 160, top: 158, width: 500, height: 700, opacity: stack, transform: `translateY(${(1 - stackSlide) * 18}px) scale(${0.98 + stackSlide * 0.02})` }}>
        <div style={{ position: "absolute", left: 18, top: 20, width: 500, height: 700, background: C.paper, border: `4px solid ${C.fg}`, transform: "rotate(4deg)", opacity: 0.55 }} />
        <div style={{ position: "absolute", left: 8, top: 10, width: 500, height: 700, background: C.paper, border: `4px solid ${C.fg}`, transform: "rotate(2deg)", opacity: 0.8 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 500,
            height: 700,
            background: "#fff",
            border: `5px solid ${C.fg}`,
            boxShadow: "14px 16px 0 rgba(35,48,59,.15)",
            transform: `perspective(1400px) rotateY(${(1 - flip) * -70}deg)`,
            transformOrigin: "left center",
            overflow: "hidden",
          }}
        >
          <Img src={staticFile(page.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
        </div>
        <div style={{ position: "absolute", left: 4, bottom: -34, fontFamily: FONT.mono, fontSize: 15, color: C.dim }}>article.pdf · page {page.n} / 21</div>

      </div>

      <div style={{ position: "absolute", left: 860, top: 130, width: 930, opacity: title, transform: `translateY(${(1 - titleSlide) * 16}px)` }}>
        <div style={{ fontFamily: FONT.display, fontSize: 82, lineHeight: 1.2 }}>
          A4 分页，
          <br />
          图表尽量同页。
        </div>
        <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.75, color: C.dim }}>
          图注跟着图片走，长表格自动分页，
          <br />
          公式不被裁切，也不会孤零零落在页脚。
        </div>
      </div>

      <div style={{ position: "absolute", left: 880, top: 470, display: "flex", gap: 34, alignItems: "flex-end", opacity: badge, transform: `translateY(${(1 - badge) * 18}px)` }}>
        <div>
          <div style={{ fontFamily: FONT.display, fontSize: 96, lineHeight: 1 }}>21</div>
          <div style={{ fontFamily: FONT.mono, fontSize: 15, color: C.dim, marginTop: 8 }}>PAGES</div>
        </div>
        <div style={{ width: 3, height: 92, background: C.line }} />
        <div>
          <div style={{ fontFamily: FONT.display, fontSize: 96, lineHeight: 1 }}>13</div>
          <div style={{ fontFamily: FONT.mono, fontSize: 15, color: C.dim, marginTop: 8 }}>IMAGES</div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 880, top: 670, display: "flex", flexDirection: "column", gap: 14, opacity: ramp(t, [25.0, 25.5]) }}>
        {["保留原站样式，只做分页适配", "图片、图注、表格按块处理", "每页都有页脚页码"].map((x) => (
          <div key={x} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: C.fg }}>
            <span style={{ color: C.green, fontFamily: FONT.mono, fontSize: 22 }}>✓</span>
            {x}
          </div>
        ))}
      </div>
    </Board>
  );
};
