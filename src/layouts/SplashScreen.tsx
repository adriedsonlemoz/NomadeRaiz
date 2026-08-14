import { useEffect, useState } from "react";
import { T as BASE_T } from "../styles/theme";
import { BicycleIcon } from "../components/common";
import { APP_NAME, APP_TAGLINE } from "../config/app";

const SPLASH_CONFIG = {
  appName: APP_NAME,
  appTagline: APP_TAGLINE,
  duracao: 2200,
  fadeOut: 400,
} as const;

type SplashPhase = "entrada" | "visivel" | "saida";

export interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [fase, setFase] = useState<SplashPhase>("entrada");

  useEffect(() => {
    const t1 = window.setTimeout(() => setFase("visivel"), 50);
    const t2 = window.setTimeout(() => setFase("saida"), SPLASH_CONFIG.duracao - SPLASH_CONFIG.fadeOut);
    const t3 = window.setTimeout(onDone, SPLASH_CONFIG.duracao);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [onDone]);

  const T = BASE_T;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: `linear-gradient(160deg,${T.navy} 0%,${T.navyMid} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fase === "saida" ? 0 : 1, transition: `opacity ${SPLASH_CONFIG.fadeOut}ms ease`, userSelect: "none",
    }}>
      <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.12)" }} />
        <div style={{
          width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${fase === "entrada" ? 0.7 : 1})`, transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <BicycleIcon size={60} color="#fff" />
        </div>
      </div>
      <div style={{
        textAlign: "center", transform: `translateY(${fase === "entrada" ? 16 : 0}px)`,
        opacity: fase === "entrada" ? 0 : 1,
        transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1), opacity 500ms ease",
      }}>
        <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.5px", lineHeight: 1 }}>{SPLASH_CONFIG.appName}</h1>
        <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, fontWeight: 500, margin: 0, letterSpacing: "0.05em" }}>{SPLASH_CONFIG.appTagline}</p>
      </div>
      <div style={{ position: "absolute", bottom: 52, display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.35)",
            animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes splashDot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );
}
