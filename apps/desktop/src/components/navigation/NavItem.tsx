import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
}

export default function NavItem({
  title,
  href,
  icon: Icon,
}: NavItemProps) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </NavLink>
  );
}