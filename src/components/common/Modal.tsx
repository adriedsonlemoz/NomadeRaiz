import type { MouseEvent, ReactNode } from "react";
import type { ThemeCtx } from "../../contexts/ThemeContext";

export interface ModalBaseProps {
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
  T: ThemeCtx["theme"];
}

export function ModalBase({ onClose, header, children, T }: ModalBaseProps) {
  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px",
    }}>
      <div onClick={stopPropagation} style={{
        width: "100%", maxWidth: 400, maxHeight: "82vh", background: T.white, borderRadius: 20,
        overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.3)",
      }}>
        <div style={{ background: T.navy, padding: "16px 18px 14px", flexShrink: 0 }}>{header}</div>
        <div style={{ padding: "16px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
