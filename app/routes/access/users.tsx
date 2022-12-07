import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Users",
};

export default function RouteComponent() {
  return <Outlet />;
}
