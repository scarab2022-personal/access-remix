import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFormAction, useLoaderData, useSubmit } from "@remix-run/react";
import { Button } from "~/components/button";
import invariant from "tiny-invariant";
import { Table } from "~/components/table";
import { Section } from "~/components/section";
import { PageHeader } from "~/components/page-header";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "db_types";
import { requireAppRole } from "~/utils";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_customer"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedCustomerResults, error: hubError } =
    await supabaseClient.rpc("get_customer", { customer_id });
  if (hubError) throw hubError;
  // Supabase seems to be adding an extra array dimension.
  const customerResults =
    mistypedCustomerResults as unknown as typeof mistypedCustomerResults[number];
  if (customerResults.length !== 1) {
    throw new Error("Invalid customer");
  }

  const { data: mistypedAccessHubs, error: accessHubsError } =
    await supabaseClient.rpc("get_access_hubs", {
      customer_id,
    });
  if (accessHubsError) throw accessHubsError;
  // Supabase seems to be adding an extra array dimension.
  const accessHubs =
    mistypedAccessHubs as unknown as typeof mistypedAccessHubs[number];

  const { data: mistypedAccessUsers, error: accessUsersError } =
    await supabaseClient.rpc("get_access_users", {
      customer_id,
    });
  if (accessUsersError) throw accessUsersError;
  // Supabase seems to be adding an extra array dimension.
  const accessUsers =
    mistypedAccessUsers as unknown as typeof mistypedAccessUsers[number];

  return {
    customer: customerResults[0],
    accessHubs,
    accessUsers,
  };
}

export const loader: LoaderFunction = async ({
  request,
  params: { customerId },
}) => {
  const { headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "admin",
  });
  invariant(customerId, "customerId not found");
  const data = await getLoaderData({
    customer_id: customerId,
    supabaseClient,
  });
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

function codeActivateExpireStatus(
  accessUser: LoaderData["accessUsers"][number]
) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activate_code_at = accessUser.activate_code_at
    ? new Date(accessUser.activate_code_at)
    : null;
  const expire_code_at = accessUser.expire_code_at
    ? new Date(accessUser.expire_code_at)
    : null;
  const now = Date.now();

  const codeStatus =
    expire_code_at && now > expire_code_at.getTime()
      ? "EXPIRED"
      : activate_code_at && now < activate_code_at.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expire_code_at
        ? `Will expire at ${expire_code_at.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expire_code_at
        ? `Will activate at ${activate_code_at?.toLocaleString()} until ${expire_code_at.toLocaleString()}.`
        : `Will activate at ${activate_code_at?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

export default function RouteComponent() {
  const { customer, accessHubs, accessUsers } = useLoaderData<LoaderData>();
  return (
    <>
      <PageHeader title={customer.email} />
      <main className="space-y-6 ">
        <Section>
          <Section.Header>Access Hubs</Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Heartbeat At</Table.Th>
                {/* <Table.Th sr>View</Table.Th> */}
              </>
            }
          >
            {accessHubs.map((i) => (
              <tr key={i.access_hub_id}>
                <Table.Td prominent>{i.name}</Table.Td>
                <Table.Td>{i.access_hub_id}</Table.Td>
                <Table.Td>{i.description}</Table.Td>
                <Table.Td>
                  {i.heartbeat_at && new Date(i.heartbeat_at).toLocaleString()}
                </Table.Td>
                {/* <Table.TdLink to={`hubs/${i.access_hub_id}`}>
                  View<span className="sr-only">, {i.name}</span>
                </Table.TdLink> */}
              </tr>
            ))}
          </Table>
        </Section>
        <Section>
          <Section.Header>Access Users</Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Code Status</Table.Th>
                <Table.Th>Activate Expire Status</Table.Th>
                {/* <Table.Th sr>View</Table.Th> */}
              </>
            }
          >
            {accessUsers.map((i) => {
              const { codeStatus, activateExpireStatus } =
                codeActivateExpireStatus(i);
              return (
                <tr key={i.access_user_id}>
                  <Table.Td prominent>{i.name}</Table.Td>
                  <Table.Td>{i.access_user_id}</Table.Td>
                  <Table.Td>{i.code}</Table.Td>
                  <Table.Td>{codeStatus}</Table.Td>
                  <Table.Td>{activateExpireStatus}</Table.Td>
                  {/* <Table.TdLink to={`users/${i.access_user_id}`}>
                    View
                  </Table.TdLink> */}
                </tr>
              );
            })}
          </Table>
        </Section>
      </main>
    </>
  );
}
