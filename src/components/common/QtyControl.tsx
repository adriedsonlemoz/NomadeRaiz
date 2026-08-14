export interface QtyControlProps {
  value: number;
  onDec: () => void;
  onInc: () => void;
}

export function QtyControl({ value, onDec, onInc }: QtyControlProps) {
  const disabled = value <= 0;
  return (
    <div className="nr-qty">
      <button onClick={onDec} disabled={disabled} className="nr-qty__button" aria-label="Diminuir quantidade">−</button>
      <span className="nr-qty__value">{value}</span>
      <button onClick={onInc} className="nr-qty__button" aria-label="Aumentar quantidade">+</button>
    </div>
  );
}
