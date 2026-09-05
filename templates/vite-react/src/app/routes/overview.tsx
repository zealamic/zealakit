import { lazy } from "react";

const OverviewRoute = lazy(() => import("@/app/features/overview/overview.route"));

export const overviewRoutes = [
  {
    index: true,
    Component: OverviewRoute,
  },
];
