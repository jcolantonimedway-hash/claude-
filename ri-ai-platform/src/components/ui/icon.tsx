import { icons, type LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  /** A Lucide icon name, e.g. "ShieldCheck". Falls back to a dot if unknown. */
  name: string;
}

/**
 * Resolves a Lucide icon by name so data files can reference icons as strings
 * without importing components into the data layer.
 */
export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = icons[name as keyof typeof icons] ?? icons.Circle;
  return <LucideIcon {...props} />;
}
