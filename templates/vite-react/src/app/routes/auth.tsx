import { lazy } from "react";
import { Outlet } from "react-router";
import { CONSTANTS } from "@/lib/constants";

const LoginRoute = lazy(() => import("@/app/features/auth/login.route"));
const SignUpRoute = lazy(() => import("@/app/features/auth/sign-up.route"));
const ForgotPasswordRoute = lazy(() => import("@/app/features/auth/forgot-password.route"));

const AuthLayout = () => <Outlet />;

export const authRoutes = [
  {
    path: CONSTANTS.ROUTES.AUTH.BASE,
    Component: AuthLayout,
    children: [
      { path: CONSTANTS.ROUTES.AUTH.LOGIN, Component: LoginRoute },
      { path: CONSTANTS.ROUTES.AUTH.SIGN_UP, Component: SignUpRoute },
      { path: CONSTANTS.ROUTES.AUTH.FORGOT_PASSWORD, Component: ForgotPasswordRoute },
    ],
  },
];
