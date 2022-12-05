import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Hub",
};

export default function RouteComponent() {
  return <Outlet />;
}
