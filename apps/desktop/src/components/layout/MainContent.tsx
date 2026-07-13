import type { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({
  children,
}: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
      {children}
    </main>
  );
}