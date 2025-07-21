import {dashboardRoutes} from "./routes/dashboardRoutes.js";
import {authRoutes} from "./routes/authRoutes.js";
import {commonRoutes} from "./routes/commonRoutes.js";

export const rootRoutes = [
  ...dashboardRoutes,
  ...authRoutes,
  ...commonRoutes
]