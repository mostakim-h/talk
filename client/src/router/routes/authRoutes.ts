import {lazy} from "react";

export const authRoutes = [
  {
    path: '/login',
    element: lazy(() => import('../../features/auth/pages/Login.tsx')),
    layout: 'publicLayout'
  },
  {
    path: '/register',
    element: lazy(() => import('../../features/auth/pages/Register.tsx')),
    layout: 'publicLayout'
  },
  {
    path: '/verify-email',
    element: lazy(() => import('../../features/auth/pages/VerifyEmail.tsx')),
    layout: 'publicLayout'
  },
  {
    path: '/reset-password',
    element: lazy(() => import('../../features/auth/pages/ResetPassword.tsx')),
    layout: 'publicLayout'
  },
  {
    path: '/forget-password',
    element: lazy(() => import('../../features/auth/pages/ForgetPassword.jsx')),
    layout: 'publicLayout'
  }
];