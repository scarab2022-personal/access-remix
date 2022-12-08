import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import type { ZodError } from "zod";
import { z } from "zod";
import { Form } from "~/components/form";
import { PageHeader } from "~/components/page-header";
import { requireAppRole } from "~/utils";

export const handle = {
  breadcrumb: "Create",
};

const FieldValues = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(100),
    code: z.string().min(3).max(50),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
};

export const action: ActionFunction = async ({ request }) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>(
      {
        formErrors: parseResult.error.formErrors,
      },
      { status: 400, headers }
    );
  }

  const { data: mistypedData, error } = await supabaseClient.rpc(
    "create_access_user",
    {
      name: parseResult.data.name,
      description: parseResult.data.description,
      code: parseResult.data.code,
      customer_id: user.id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return redirect(`/access/users/${data[0].access_user_id}`, { headers });
};

export default function RouteComponent() {
  const actionData = useActionData<ActionData>();
  return (
    <>
      <PageHeader />
      <main>
        <Form method="post" className="mx-auto max-w-sm" replace>
          <Form.Header
            title="Create Access User"
            errors={actionData?.formErrors?.formErrors}
          />
          <Form.Body>
            <Form.Field
              id="name"
              label="Name"
              errors={actionData?.formErrors?.fieldErrors?.name}
            >
              <input type="text" name="name" id="name" />
            </Form.Field>
            <Form.Field
              id="description"
              label="Description"
              errors={actionData?.formErrors?.fieldErrors?.description}
            >
              <textarea name="description" id="description" rows={3} />
            </Form.Field>
            <Form.Field
              id="code"
              label="Code"
              errors={actionData?.formErrors?.fieldErrors?.code}
            >
              <input type="text" name="code" id="code" />
            </Form.Field>
          </Form.Body>
          <Form.Footer>
            <Form.CancelButton />
            <Form.SubmitButton>Create</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}
