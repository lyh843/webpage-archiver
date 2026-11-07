import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";
import "./lib/fonts";
import { EASE, ramp, useTime } from "./lib/anim";
import { C } from "./lib/theme";
import { Brand } from "./scenes/Brand";
import { Break } from "./scenes/Break";
import { Cta } from "./scenes/Cta";
import { HtmlScene } from "./scenes/HtmlScene";
import { MdScene } from "./scenes/MdScene";
import { Montage } from "./scenes/Montage";
import { Open } from "./scenes/Open";
import { PdfScene } from "./scenes/PdfScene";

export type PromoProps = { withAudio: boolean; webMode?: boolean };

const CUTS = [5.016, 10.033, 15.05, 22.57, 27.59, 32.6, 37.62];

/** 一条窄纸条从画面上方划过，给场景切换一点手工感。 */
const PaperSwoosh: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CUTS.map((b, i) => {
      const p = ramp(t, [b - 0.06, b + 0.06], [0, 1], EASE.inOut);
      if (p <= 0 || p >= 1) return null;
      return (
        <div
          key={b}
          style={{
            position: "absolute",
            top: -80,
            left: `${p * 112 - 12}%`,
            width: 90,
            height: 1240,
            background: i % 2 === 0 ? "rgba(255,253,244,.96)" : "rgba(255,216,106,.92)",
            borderLeft: `2px solid rgba(35,48,59,.16)`,
            borderRight: `2px solid rgba(35,48,59,.10)`,
            boxShadow: "18px 0 40px rgba(35,48,59,.12)",
            transform: "rotate(7deg)",
            pointerEvents: "none",
          }}
        />
      );
    })}
  </>
);

/** Every scene takes absolute time `t` in seconds and renders nothing outside its window in timing.json. */
export const Promo: React.FC<PromoProps> = ({ withAudio, webMode = false }) => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Open t={t} />
      <Break t={t} />
      <Brand t={t} />
      <HtmlScene t={t} />
      <PdfScene t={t} />
      <MdScene t={t} />
      <Montage t={t} />
      <Cta t={t} />
      <PaperSwoosh t={t} />
      {withAudio &&
        (webMode ? (
          // @remotion/media 在浏览器跑不满帧时会重复排程音频块，叠成多重回音；网页版改用 <audio> 元素
          <Html5Audio src={staticFile("audio/mix.wav")} />
        ) : (
          <Audio src={staticFile("audio/mix.wav")} />
        ))}
    </AbsoluteFill>
  );
};
