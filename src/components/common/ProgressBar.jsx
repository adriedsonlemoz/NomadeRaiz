import { useTheme } from "../../hooks";

export function Bar({ pct, h=4, cor }) {
  const { theme: T } = useTheme();
  return (
    <div style={{ height:h, background:T.blueChip, borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.min(100,Math.max(0,pct))}%`, borderRadius:99,
        background: cor ?? `linear-gradient(90deg,${T.blue},${T.blueSoft})`,
        transition:"width .5s" }}/>
    </div>
  );
}

export function Ring({ pct }) {
  const { theme: T } = useTheme();
  const r=36, circ=2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:84, height:84, flexShrink:0 }}>
      <svg width="84" height="84" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="42" cy="42" r={r} fill="none" stroke={T.blueChip} strokeWidth="7"/>
        <circle cx="42" cy="42" r={r} fill="none" stroke="url(#rg)" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
          style={{ transition:"stroke-dashoffset .7s" }}/>
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={T.blue}/><stop offset="100%" stopColor={T.blueSoft}/>
        </linearGradient></defs>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center" }}>
        <span style={{ color:T.textMain, fontWeight:900, fontSize:18, lineHeight:1 }}>{pct}%</span>
        <span style={{ color:T.textMuted, fontSize:9 }}>pronto</span>
      </div>
    </div>
  );
}
