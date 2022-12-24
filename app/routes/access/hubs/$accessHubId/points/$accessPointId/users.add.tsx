import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";
import { Checkbox } from "~/components/checkbox";
import { requireAppRole } from "~/lib/utils";
import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const handle = {
  breadcrumb: "Add Users",
};

async function getLoaderData({
  access_point_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_users_not_connected_to_point"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_users_not_connected_to_point",
    {
      access_point_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { accessUsers: data };
}

export const loader = (async ({
  request,
  params: { accessPointId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessPointId, "accessPointId not found");
  const data = await getLoaderData({
    access_point_id: Number(accessPointId),
    customer_id: user.id,
    supabaseClient,
  });
  return json(data, {
    headers, // for set-cookie
  });
}) satisfies LoaderFunction;

export const action: ActionFunction = async ({
  request,
  params: { accessHubId, accessPointId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessHubId, "accessHubId not found");
  invariant(accessPointId, "accessPointId not found");

  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let access_user_ids = [];
  for (let idx = 0; fieldValues[`accessUser-${idx}-id`]; ++idx) {
    if (fieldValues[`accessUser-${idx}`]) {
      access_user_ids.push(Number(fieldValues[`accessUser-${idx}-id`]));
    }
  }
  if (access_user_ids.length > 0) {
    const { error } = await supabaseClient.rpc(
      "connect_access_points_and_users",
      {
        access_point_ids: [Number(accessPointId)],
        access_user_ids,
        customer_id: user.id,
      }
    );
    if (error) throw error;
  }
  return redirect(`/access/hubs/${accessHubId}/points/${accessPointId}`, {
    headers,
  });
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<typeof loader>();
  return (
    <>
      <PageHeader />
      <main>
        <Form replace method="post" className="mx-auto max-w-sm">
          <Form.Header title="Add Users" />
          <Form.Body>
            <Form.List>
              {accessUsers.map((i, idx) => {
                const idName = `accessUser-${idx}`;
                const hiddenIdName = `${idName}-id`;
                return (
                  <Checkbox.ListItem
                    key={i.access_user_id}
                    labelProps={{
                      htmlFor: idName,
                      children: i.name,
                    }}
                    checkboxProps={{ id: idName, name: idName }}
                  >
                    <input
                      id={hiddenIdName}
                      name={hiddenIdName}
                      type="hidden"
                      value={i.access_user_id}
                    />
                  </Checkbox.ListItem>
                );
              })}
            </Form.List>
          </Form.Body>
          <Form.Footer>
            <Form.CancelButton />
            <Form.SubmitButton>Add</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}
