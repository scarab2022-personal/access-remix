import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useFormAction,
} from "@remix-run/react";
import { Button } from "~/components/button";
import { PencilIcon } from "@heroicons/react/24/solid";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Table } from "~/components/table";
import { Section } from "~/components/section";
import { DescriptionList } from "~/components/description-list";
import { requireAppRole } from "~/lib";
import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

/*
 access_user_id │  name  │ description │ code │ activate_code_at │ expire_code_at │ access_point_id │ access_point_name │ access_hub_name 
════════════════╪════════╪═════════════╪══════╪══════════════════╪════════════════╪═════════════════╪═══════════════════╪═════════════════
              4 │ master │             │ 999  │ ¤                │ ¤              │               9 │ Point 1           │ Hub 1
              4 │ master │             │ 999  │ ¤                │ ¤              │              13 │ Point 1           │ Hub 2

 access_user_id │  name  │ description │ code │ activate_code_at │ expire_code_at │ access_point_id │ access_point_name │ access_hub_name 
════════════════╪════════╪═════════════╪══════╪══════════════════╪════════════════╪═════════════════╪═══════════════════╪═════════════════
              4 │ master │             │ 999  │ ¤                │ ¤              │               ¤ │ ¤                 │ ¤

*/

async function getLoaderData({
  access_user_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_user_with_points"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_user_with_points",
    {
      access_user_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { results: data };
}

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessUserId, "accessUserId not found");
  const data = await getLoaderData({
    access_user_id: Number(accessUserId),
    customer_id: user.id,
    supabaseClient,
  });
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

function codeActivateExpireStatus(accessUser: LoaderData["results"][number]) {
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
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("points");
  const { results } = useLoaderData<LoaderData>();
  const accessUserResult = results[0];
  const { codeStatus, activateExpireStatus } =
    codeActivateExpireStatus(accessUserResult);
  return (
    <>
      <PageHeader
        title={accessUserResult.name}
        side={
          <Button onClick={() => navigate("edit")}>
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Edit
          </Button>
        }
      />
      <main className="space-y-6">
        <Section className="mx-auto max-w-lg">
          <DescriptionList>
            <DescriptionList.Item
              term="Code"
              description={accessUserResult.code}
            />
            <DescriptionList.Item term="Code Status" description={codeStatus} />
            <DescriptionList.Item
              term="ID"
              description={accessUserResult.access_user_id.toString()}
            />
            <DescriptionList.Item
              term="Activate Expire Status"
              description={activateExpireStatus}
            />
            <DescriptionList.Item
              term="Description"
              description={accessUserResult.description}
            />
          </DescriptionList>
        </Section>
        <Section>
          <Section.Header
            side={<Button onClick={() => navigate("points/add")}>Add</Button>}
          >
            Access Points
          </Section.Header>
          <Section.Body>
            <Table
              headers={
                <>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Hub</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th sr>View</Table.Th>
                </>
              }
            >
              {(results[0].access_point_id ? results : results.slice(1)).map(
                (i) => (
                  <tr key={i.access_point_id}>
                    <Table.Td prominent>{i.access_point_name}</Table.Td>
                    <Table.Td>{i.access_hub_name}</Table.Td>
                    <Table.Td>{i.access_point_description}</Table.Td>
                    <Table.TdLink
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          method: "post",
                          action: `${removeFormActionBase}/${i.access_point_id}/remove`,
                        });
                      }}
                    >
                      Remove
                    </Table.TdLink>
                  </tr>
                )
              )}
            </Table>
          </Section.Body>
        </Section>
      </main>
    </>
  );
}
