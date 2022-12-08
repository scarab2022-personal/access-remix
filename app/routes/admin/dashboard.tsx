import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "db_types";
import { PageHeader } from "~/components/page-header";
import { requireAppRole } from "~/utils";

export const handle = {
  breadcrumb: "Dashboard",
};

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  supabaseClient,
}: {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_admin_stats",
    {}
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  if (data.length !== 1) {
    throw new Error("Invalid stats");
  }

  return { stats: data[0] };
}

export const loader: LoaderFunction = async ({ request }) => {
  const { headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "admin",
  });
  const data = await getLoaderData({ supabaseClient });
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

export default function RouteComponent() {
  const { stats } = useLoaderData<LoaderData>();
  const cards: { name: string; key: keyof typeof stats }[] = [
    { name: "Customers", key: "customer" },
    { name: "Access Hubs", key: "access_hub" },
    { name: "Grants", key: "grant" },
    { name: "Denies", key: "deny" },
  ];
  return (
    <>
      <PageHeader title="Dashboard" />
      <main>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
          {cards.map((i) => (
            <div
              key={i.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-gray-500">
                {i.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {stats[i.key]}
              </dd>
            </div>
          ))}
        </dl>
      </main>
      {/* <pre>{JSON.stringify(stats, null, 2)}</pre> */}
    </>
  );
}
