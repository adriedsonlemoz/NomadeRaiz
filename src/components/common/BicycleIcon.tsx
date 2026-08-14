export interface BicycleIconProps {
  size?: number;
  color?: string;
}

export default function BicycleIcon({ size = 72, color = "#ffffff" }: BicycleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      role="img" aria-label="Bicicleta">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M5.5 17.5 L10 6" /><path d="M10 6 L18.5 17.5" />
      <path d="M10 6 L14 6" /><path d="M14 6 L18.5 17.5" />
      <path d="M10 6 L12 11 L5.5 17.5" />
      <path d="M13.5 6 L16 6" /><path d="M14.5 6 L14.5 4.5" />
      <path d="M13.5 4.5 L16 4.5" /><path d="M8.5 6 L11.5 6" />
    </svg>
  );
}
