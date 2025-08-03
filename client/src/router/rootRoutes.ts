import {authRoutes} from "./routes/authRoutes.ts";
import {dashboardRoutes} from "@/router/routes/dashboardRoutes.ts";
import {commonRoutes} from "./routes/commonRoutes.ts";
import {chatRoutes} from "@/router/routes/chatRoutes.ts";

export const rootRoutes = [
  ...dashboardRoutes,
  ...authRoutes,
  ...commonRoutes,
  ...chatRoutes
]