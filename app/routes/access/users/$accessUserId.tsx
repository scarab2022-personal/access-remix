import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "User",
};

export default function RouteComponent() {
  return <Outlet />;
}
