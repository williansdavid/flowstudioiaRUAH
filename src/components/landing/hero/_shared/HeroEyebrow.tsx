interface HeroEyebrowProps {
  children: string;
}

export function HeroEyebrow({ children }: HeroEyebrowProps) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
      {children}
    </p>
  );
}
