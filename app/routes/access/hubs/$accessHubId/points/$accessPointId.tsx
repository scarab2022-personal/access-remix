import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Point",
};

export default function RouteComponent() {
  return <Outlet />;
}
