import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
}

export default function NavItem({
  title,
  icon: Icon,
  active = false,
}: NavItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </button>
  );
}