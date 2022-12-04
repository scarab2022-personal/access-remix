import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Hubs",
};

export default function RouteComponent() {
  return <Outlet />;
}
