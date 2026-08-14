import type { MouseEvent, ReactNode } from "react";

export interface ModalBaseProps {
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
}

export function ModalBase({ onClose, header, children }: ModalBaseProps) {
  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();

  return (
    <div onClick={onClose} className="nr-modal-overlay" role="presentation">
      <div onClick={stopPropagation} className="nr-modal" role="dialog" aria-modal="true">
        <div className="nr-modal__header">{header}</div>
        <div className="nr-modal__body">{children}</div>
      </div>
    </div>
  );
}
