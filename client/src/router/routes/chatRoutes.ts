import {lazy} from "react";

export const chatRoutes = [
  {
    path: "/",
    element: lazy(() => import('../../features/chat/pages/Chat.tsx')),
    layout: 'privateLayout',
    isPublic: false
  }
]