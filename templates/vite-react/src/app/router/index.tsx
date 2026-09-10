import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { authRoutes } from "./auth";
import { featureARoutes } from "./feature-a";
import { overviewRoutes } from "./overview";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: Outlet,
    children: [...overviewRoutes, ...authRoutes, ...featureARoutes],
  },
];

const router = createBrowserRouter(routes);
export default router;
