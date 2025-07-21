import {lazy} from "react";

export const authRoutes = [
  {
    path: '/login',
    element: lazy(() => import('../../features/auth/pages/Login.jsx')),
    layout: 'publicLayout'
  },
  {
    path: '/register',
    element: lazy(() => import('../../features/auth/pages/Register.jsx')),
    layout: 'publicLayout'
  },
  {
    path: '/verify-email',
    element: lazy(() => import('../../features/auth/pages/VerifyEmail.jsx')),
    layout: 'publicLayout'
  },
  {
    path: '/reset-password',
    element: lazy(() => import('../../features/auth/pages/ResetPassword.jsx')),
    layout: 'publicLayout'
  },
  {
    path: '/forget-password',
    element: lazy(() => import('../../features/auth/pages/ForgetPassword.jsx')),
    layout: 'publicLayout'
  }
];