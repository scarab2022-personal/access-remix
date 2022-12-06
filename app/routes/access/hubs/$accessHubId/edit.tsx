import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import type { ZodError } from "zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "db_types";
import { requireAppRole } from "~/utils";

export const handle = {
  breadcrumb: "Edit",
};

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  access_hub_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_hub"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_hub",
    {
      access_hub_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  if (data.length !== 1) {
    throw new Error("Invalid access hub")
  }

  return { accessHub: data[0] };
}

export const loader: LoaderFunction = async ({
  request,
  params: { accessHubId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessHubId, "accessHubId not found");
  const data = await getLoaderData({
    access_hub_id: Number(accessHubId),
    customer_id: user.id,
    supabaseClient,
  });
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

const FieldValues = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(100),
});

type ActionData = {
  formErrors?: ZodError["formErrors"];
};

export const action: ActionFunction = async ({
  request,
  params: { accessHubId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessHubId, "accessHubId not found");

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>(
      { formErrors: parseResult.error.formErrors },
      { status: 400, headers }
    );
  }

  const { data: mistypedData, error } = await supabaseClient.rpc(
    "update_access_hub",
    {
      access_hub_id: Number(accessHubId),
      customer_id: user.id,
      name: parseResult.data.name,
      description: parseResult.data.description,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  if (data.length !== 1) {
    throw new Error("Invalid access hub");
  }

  return redirect(`/access/hubs/${accessHubId}`, { headers });
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <PageHeader />
      <main>
        <Form method="post" className="mx-auto max-w-sm" replace>
          <Form.Header
            title="Access Hub Settings"
            errors={actionData?.formErrors?.formErrors}
          />
          <Form.Body>
            <Form.Field
              id="name"
              label="Name"
              errors={actionData?.formErrors?.fieldErrors?.name}
            >
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={accessHub.name}
              />
            </Form.Field>
            <Form.Field
              id="description"
              label="Description"
              errors={actionData?.formErrors?.fieldErrors?.description}
            >
              <textarea
                name="description"
                id="description"
                rows={3}
                defaultValue={accessHub.description}
              />
            </Form.Field>
          </Form.Body>
          <Form.Footer>
            <Form.CancelButton />
            <Form.SubmitButton>Save</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}
