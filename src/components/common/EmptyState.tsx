export interface EmptyStateProps {
  text: string;
}

export function EmptyState({ text }: EmptyStateProps) {
  return <p className="nr-empty-state">{text}</p>;
}
