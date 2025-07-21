import {lazy} from "react";

export const dashboardRoutes = [
  {
    path: "/",
    element: lazy(() => import('../../features/dashboard/pages/Dashboard.jsx')),
    layout: 'privateLayout',
  }
]