import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Customers",
};

export default function RouteComponent() {
  return <Outlet />;
}
