import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-gold-gradient text-[#17130A]",
  admin: "bg-[color:var(--teal)]/20 text-[color:var(--teal)] border border-[color:var(--teal)]/30",
  member: "bg-white/[0.06] text-foreground border border-white/10",
};

export function RoleBadge({ roleKey, roleName }: { roleKey: string; roleName: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.14em]",
        ROLE_STYLES[roleKey] ?? "bg-white/[0.03] text-muted-foreground border border-white/10",
      )}
    >
      {roleName}
    </span>
  );
}