import { Gift, PartyPopper, Snowflake, Sparkles } from "lucide-react";

const icons = { gift: Gift, celebration: PartyPopper, snowflake: Snowflake, sparkles: Sparkles };

export function FestiveMark({ kind, warm = false }: { kind: keyof typeof icons; warm?: boolean }) {
  const Icon = icons[kind];
  return <span className={`festive-mark${warm ? " warm" : ""}`} aria-hidden="true"><Icon size={26} strokeWidth={1.65} /></span>;
}
