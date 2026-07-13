import NavItem from "@/components/navigation/NavItem";
import { navigation } from "@/constants/navigation";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="border-b p-6">
        <h1 className="text-xl font-bold">Pulse AI</h1>
        <p className="text-sm text-muted-foreground">
          Intelligent Windows Assistant
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Pulse AI v0.1.0-dev
        </p>
      </div>
    </aside>
  );
}