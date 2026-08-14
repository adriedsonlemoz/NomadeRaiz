import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="nr-section-label">{children}</p>;
}
