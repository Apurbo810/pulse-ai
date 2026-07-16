import { Outlet } from "react-router-dom";

import Header from "./Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <MainContent>
          <Outlet />
        </MainContent>
      </div>
    </div>
  );
}