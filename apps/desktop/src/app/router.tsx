import { createBrowserRouter } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";

import DashboardPage from "@/features/dashboard/DashboardPage";
import MonitoringPage from "@/features/monitoring/pages/MonitoringPage";
import StoragePage from "@/features/storage/pages/StoragePage";
import ProcessesPage from "@/features/processes/ProcessesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "monitoring",
        element: <MonitoringPage />,
      },
      {
        path: "storage",
        element: <StoragePage />,
      },
      {
        path: "processes",
        element: <ProcessesPage />,
      },
    ],
  },
]);