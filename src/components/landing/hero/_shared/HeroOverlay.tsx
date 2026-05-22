interface HeroOverlayProps {
  color?: string;
  opacity?: number;
}

export function HeroOverlay({ color = '#000000', opacity = 0.55 }: HeroOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ backgroundColor: color, opacity }}
    />
  );
}
