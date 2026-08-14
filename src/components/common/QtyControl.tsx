import { useTheme } from "../../hooks";

export interface QtyControlProps {
  value: number;
  onDec: () => void;
  onInc: () => void;
}

export function QtyControl({ value, onDec, onInc }: QtyControlProps) {
  const { theme: T } = useTheme();
  const disabled = value <= 0;
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${T.border}`, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
      <button onClick={onDec} disabled={disabled} style={{
        width: 32, height: 32, border: "none", cursor: disabled ? "default" : "pointer",
        background: disabled ? T.blueChip : T.blueLight, color: disabled ? T.textMuted : T.blue,
        fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}>−</button>
      <span style={{ padding: "0 10px", color: T.textMain, fontWeight: 700, fontSize: 13, minWidth: 28, textAlign: "center" }}>{value}</span>
      <button onClick={onInc} style={{
        width: 32, height: 32, border: "none", cursor: "pointer", background: T.blueLight, color: T.blue,
        fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
      }}>+</button>
    </div>
  );
}
