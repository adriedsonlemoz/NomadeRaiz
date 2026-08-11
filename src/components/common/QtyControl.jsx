import { useTheme } from "../../hooks";

export function QtyControl({ value, onDec, onInc }) {
  const { theme: T } = useTheme();
  return (
    <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${T.border}`,
      borderRadius:10, overflow:"hidden", flexShrink:0 }}>
      <button onClick={onDec} disabled={value<=0} style={{ width:32, height:32, border:"none",
        cursor:value<=0?"default":"pointer", background:value<=0?T.blueChip:T.blueLight,
        color:value<=0?T.textMuted:T.blue, fontSize:18, fontWeight:700,
        display:"flex", alignItems:"center", justifyContent:"center", opacity:value<=0?.4:1 }}>−</button>
      <span style={{ padding:"0 10px", color:T.textMain, fontWeight:700, fontSize:13,
        minWidth:28, textAlign:"center" }}>{value}</span>
      <button onClick={onInc} style={{ width:32, height:32, border:"none", cursor:"pointer",
        background:T.blueLight, color:T.blue, fontSize:18, fontWeight:700,
        display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
    </div>
  );
}
