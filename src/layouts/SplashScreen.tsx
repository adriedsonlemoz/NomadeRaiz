import { useEffect, useState, type CSSProperties } from "react";
import { APP_NAME, APP_TAGLINE } from "../config/app";

const SPLASH_CONFIG = { appName: APP_NAME, appTagline: APP_TAGLINE, duracao: 2200, fadeOut: 400 } as const;
type SplashPhase = "entrada" | "visivel" | "saida";
type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export interface SplashScreenProps { onDone: () => void; }

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [fase, setFase] = useState<SplashPhase>("entrada");

  useEffect(() => {
    const t1 = window.setTimeout(() => setFase("visivel"), 50);
    const t2 = window.setTimeout(() => setFase("saida"), SPLASH_CONFIG.duracao - SPLASH_CONFIG.fadeOut);
    const t3 = window.setTimeout(onDone, SPLASH_CONFIG.duracao);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="nr-splash" data-phase={fase}>
      <div className="nr-splash__icon-wrap">
        <div className="nr-splash__orbit" />
        <div className="nr-splash__icon"><img src="./icons/app-logo.png" alt="" className="nr-splash__logo" /></div>
      </div>
      <div className="nr-splash__copy">
        <h1 className="nr-splash__title">{SPLASH_CONFIG.appName}</h1>
        <p className="nr-splash__tagline">{SPLASH_CONFIG.appTagline}</p>
      </div>
      <div className="nr-splash__dots" aria-hidden="true">
        {[0, 1, 2].map((i) => {
          const style: CssVars = { '--nr-dot-delay': `${i * .2}s` };
          return <span key={i} className="nr-splash__dot" style={style} />;
        })}
      </div>
    </div>
  );
}
