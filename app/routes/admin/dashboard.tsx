import type { LoaderFunction } from "@remix-run/node";
import { PageHeader } from "~/components/page-header";
import { requireAppRole } from "~/utils";

export const handle = {
  breadcrumb: "Dashboard",
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAppRole({
    request,
    appRole: "admin",
  });
  return null;
};

export default function RouteComponent() {
  return (
    <>
      <PageHeader title="Dashboard" />
    </>
  );
}
