import {authRoutes} from "./routes/authRoutes.ts";
import {commonRoutes} from "./routes/commonRoutes.ts";
import {chatRoutes} from "@/router/routes/chatRoutes.ts";

export const rootRoutes = [
  ...authRoutes,
  ...commonRoutes,
  ...chatRoutes
]