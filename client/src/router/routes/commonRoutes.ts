import {lazy} from "react";

export const commonRoutes = [
  {
    path: '/404',
    element: lazy(() => import('../../features/common/NotFound.tsx')),
    layout: 'blankLayout'
  }
]