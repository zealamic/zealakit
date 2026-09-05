import { lazy } from "react";
import { CONSTANTS } from "@/lib/constants";

const FeatureAListRoute = lazy(() => import("@/app/features/feature-a/feature-a-list.route"));
const FeatureADetailRoute = lazy(() => import("@/app/features/feature-a/feature-a-detail.route"));
const FeatureAShellRoute = lazy(() => import("@/app/features/feature-a/feature-a-shell.route"));

export const featureARoutes = [
  {
    path: CONSTANTS.ROUTES.FEATURE_A.BASE,
    Component: FeatureAShellRoute,
    children: [
      { index: true, Component: FeatureAListRoute },
      { path: ":id", Component: FeatureADetailRoute },
    ],
  },
];
