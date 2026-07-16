import { createBrowserRouter } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";

import DashboardPage from "@/features/dashboard/DashboardPage";
import MonitoringPage from "@/features/monitoring/MonitoringPage";

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
    ],
  },
]);