import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";
import { Checkbox } from "~/components/checkbox";
import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAppRole } from "~/lib/utils";

export const handle = {
  breadcrumb: "Add Points",
};

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  access_user_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_points_not_connected_to_user"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_points_not_connected_to_user",
    {
      access_user_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { accessPoints: data };
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

export const action: ActionFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessUserId, "accessUserId not found");

  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let access_point_ids = [];
  for (let idx = 0; fieldValues[`accessPoint-${idx}-id`]; ++idx) {
    if (fieldValues[`accessPoint-${idx}`]) {
      access_point_ids.push(Number(fieldValues[`accessPoint-${idx}-id`]));
    }
  }
  if (access_point_ids.length > 0) {
    const { error } = await supabaseClient.rpc(
      "connect_access_points_and_users",
      {
        access_point_ids,
        access_user_ids: [Number(accessUserId)],
        customer_id: user.id,
      }
    );
    if (error) throw error;
  }
  return redirect(`/access/users/${accessUserId}`, { headers });
};

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  // Simple list with heading
  // https://tailwindui.com/components/application-ui/forms/checkboxes
  // <div class="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
  return (
    <>
      <PageHeader />
      <main>
        <Form replace method="post" className="mx-auto max-w-sm">
          <Form.Header title="Add Points" />
          <Form.Body>
            <Form.List>
              {accessPoints.map((i, idx) => {
                const idName = `accessPoint-${idx}`;
                const hiddenIdName = `${idName}-id`;
                return (
                  <Checkbox.ListItem
                    key={i.access_point_id}
                    labelProps={{
                      htmlFor: idName,
                      children: `${i.access_hub_name}: ${i.name}`,
                    }}
                    checkboxProps={{ id: idName, name: idName }}
                  >
                    <input
                      id={hiddenIdName}
                      name={hiddenIdName}
                      type="hidden"
                      value={i.access_point_id}
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
