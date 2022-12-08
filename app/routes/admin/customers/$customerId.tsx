import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Customer",
};

export default function RouteComponent() {
  return <Outlet />;
}
