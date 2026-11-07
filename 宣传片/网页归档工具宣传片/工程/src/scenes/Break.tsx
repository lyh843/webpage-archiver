import React from "react";
import { Img, staticFile } from "remotion";
import { Board } from "../components/Board";
import { HandArrow } from "../components/HandArrow";
import { EASE, ramp, scene } from "../lib/anim";
import { C, FONT } from "../lib/theme";

export const Break: React.FC<{ t: number }> = ({ t }) => {
  const s = scene("break");
  if (t < s.start || t >= s.end) return null;
  const head = 1;
  const headSlide = ramp(t, [s.start, s.start + 0.45]);
  const photo = 1;
  const photoSlide = ramp(t, [s.start + 0.05, s.start + 0.5]);
  const strike = ramp(t, [s.start + 1.5, s.start + 1.95], [0, 1], EASE.inOut);
  const x1 = ramp(t, [s.start + 1.85, s.start + 2.25]);
  const x2 = ramp(t, [s.start + 2.0, s.start + 2.4]);
  const note = ramp(t, [s.start + 2.9, s.start + 3.4]);
  const l1 = ramp(t, [s.start + 2.2, s.start + 2.6]);
  const l2 = ramp(t, [s.start + 2.6, s.start + 3.0]);
  const l3 = ramp(t, [s.start + 3.0, s.start + 3.4]);

  return (
    <Board note="ARCHIVE NOTES / 02">
      <div style={{ position: "absolute", left: 92, top: 190, width: 720, opacity: head, transform: `translateY(${(1 - headSlide) * 22}px)` }}>
        <div style={{ fontFamily: FONT.display, fontSize: 104, lineHeight: 1.18 }}>
          但原链接，
          <br />
          可能<span style={{ position: "relative", color: C.red }}>明天
            <span
              style={{
                position: "absolute",
                left: -6,
                top: "52%",
                width: "112%",
                height: 7,
                background: C.red,
                transform: `rotate(-2deg) scaleX(${strike})`,
                transformOrigin: "left center",
              }}
            />
          </span>
          就没了。
        </div>
        <div style={{ marginTop: 36, fontSize: 30, lineHeight: 1.7, color: C.dim }}>
          网页会改版，图片会下架，
          <br />
          公式依赖的 CDN 也会失效。
        </div>
      </div>

      <div style={{ position: "absolute", left: 880, top: 176, width: 900, opacity: photo, transform: `rotate(-2deg) translateY(${(1 - photoSlide) * 22}px)` }}>
        <div style={{ position: "relative", background: C.paper, border: `5px solid ${C.fg}`, boxShadow: "14px 16px 0 rgba(35,48,59,.15)", padding: 10 }}>
          <Img src={staticFile("img/original.jpg")} style={{ width: "100%", display: "block" }} />
          <div style={{ position: "absolute", inset: 16, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: "12%", top: "32%", width: "76%", height: 9, background: C.red, transform: `rotate(-17deg) scaleX(${x1})`, transformOrigin: "left center", opacity: 0.86 }} />
            <div style={{ position: "absolute", left: "12%", top: "58%", width: "72%", height: 9, background: C.red, transform: `rotate(15deg) scaleX(${x2})`, transformOrigin: "left center", opacity: 0.86 }} />
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: FONT.mono, fontSize: 15, color: C.faint }}>原始页面 · 抓取前</div>
      </div>

      <div style={{ position: "absolute", left: 760, top: 258, opacity: l1, transform: `rotate(-7deg) translateY(${(1 - l1) * 14}px)` }}>
        <div style={{ background: C.yellow, border: `3px solid ${C.fg}`, padding: "10px 16px", fontFamily: FONT.display, fontSize: 30 }}>图片裂了</div>
      </div>
      <div style={{ position: "absolute", left: 1460, top: 628, opacity: l2, transform: `rotate(5deg) translateY(${(1 - l2) * 14}px)` }}>
        <div style={{ background: C.yellow, border: `3px solid ${C.fg}`, padding: "10px 16px", fontFamily: FONT.display, fontSize: 30 }}>公式乱了</div>
      </div>
      <div style={{ position: "absolute", left: 760, top: 760, opacity: l3, transform: `rotate(4deg) translateY(${(1 - l3) * 14}px)` }}>
        <div style={{ background: C.yellow, border: `3px solid ${C.fg}`, padding: "10px 16px", fontFamily: FONT.display, fontSize: 30 }}>链接失效了</div>
      </div>

      <HandArrow d="M 850 330 C 810 360, 820 410, 880 428" width={80} height={120} progress={l1} style={{ position: "absolute", left: 770, top: 300 }} />
      <HandArrow d="M 1470 610 C 1430 580, 1380 570, 1330 580" width={160} height={100} progress={l2} style={{ position: "absolute", left: 1300, top: 540 }} />

      <div
        style={{
          position: "absolute",
          left: 94,
          bottom: 104,
          fontFamily: FONT.display,
          fontSize: 34,
          color: C.dim,
          opacity: note,
          transform: `rotate(-1deg) translateY(${(1 - note) * 12}px)`,
        }}
      >
        这不是某一篇的意外，是网页的日常。
      </div>
      <div style={{ position: "absolute", right: 92, bottom: 108, fontFamily: FONT.mono, fontSize: 14, color: C.faint, opacity: note }}>SOURCE: 公开文章页面截图</div>
    </Board>
  );
};
