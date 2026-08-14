import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function PageHeader({ title, eyebrow, onBack, right }: PageHeaderProps) {
  return (
    <header className="nr-page-header">
      <div className="nr-page-header__row">
        {onBack && <button aria-label="Voltar" onClick={onBack} className="nr-page-header__back">←</button>}
        <div className="nr-page-header__content">
          {eyebrow && <p className="nr-page-header__eyebrow">{eyebrow}</p>}
          <h1 className="nr-page-header__title">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}
