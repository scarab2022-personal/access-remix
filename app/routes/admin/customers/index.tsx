import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Table } from "~/components/table";
import { PageHeader } from "~/components/page-header";
import { requireAppRole } from "~/lib/utils";
import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getLoaderData({
  supabaseClient,
}: {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_customers",
    {}
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { customers: data };
}

export const loader = (async ({ request }) => {
  const { headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "admin",
  });
  const data = await getLoaderData({
    supabaseClient,
  });
  return json(data, {
    headers, // for set-cookie
  });
}) satisfies LoaderFunction;

export default function RouteComponent() {
  const { customers } = useLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Customers" />
      <main>
        <Table
          headers={
            <>
              <Table.Th>Email</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Last Sign In</Table.Th>
              <Table.Th sr>View</Table.Th>
            </>
          }
        >
          {customers.map((i) => (
            <tr key={i.customer_id}>
              <Table.Td prominent>{i.email}</Table.Td>
              <Table.Td>{new Date(i.created_at).toLocaleDateString()}</Table.Td>
              <Table.Td>
                {new Date(i.last_sign_in_at).toLocaleDateString()}
              </Table.Td>
              <Table.TdLink to={`${i.customer_id}`}>View</Table.TdLink>
            </tr>
          ))}
        </Table>
      </main>
    </>
  );
}
