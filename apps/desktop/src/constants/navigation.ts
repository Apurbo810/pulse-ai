import {
  LayoutDashboard,
  Activity,
  HardDrive,
  FolderKanban,
  Gamepad2,
  Wrench,
  Bot,
  Settings,
} from "lucide-react";


export const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Monitoring",
    icon: Activity,
    href: "/monitoring",
  },
  {
  title: "Storage",
  icon: HardDrive,
  href: "/storage",
  },
  {
    title: "Processes",
    icon: FolderKanban,
    href: "/processes",
  },
  {
    title: "Gaming",
    icon: Gamepad2,
    href: "/gaming",
  },
  {
    title: "Optimizer",
    icon: Wrench,
    href: "/optimizer",
  },
  {
    title: "AI",
    icon: Bot,
    href: "/ai",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];