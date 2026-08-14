import type { ThemeCtx } from "../../contexts/ThemeContext";

export interface EmptyStateProps {
  text: string;
  T: ThemeCtx["theme"];
}

export function EmptyState({ text, T }: EmptyStateProps) {
  return <p style={{ color: T.textMuted, fontSize: 12, textAlign: "center", padding: "14px 6px" }}>{text}</p>;
}
