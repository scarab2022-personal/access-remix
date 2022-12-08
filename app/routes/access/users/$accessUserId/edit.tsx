import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import type { ZodError } from "zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";
import { Transition, Dialog } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import React, { useState, useRef, Fragment } from "react";
import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAppRole } from "~/utils";

export const handle = {
  breadcrumb: "Edit",
};

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  access_user_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_user"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_user",
    {
      access_user_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  if (data.length !== 1) {
    throw new Error("Invalid access user");
  }

  return { accessUser: data[0] };
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

async function softDeleteAccessUser({
  access_user_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["soft_delete_access_user"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "soft_delete_access_user",
    {
      access_user_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  if (data.length !== 1) {
    throw new Error("Invalid access user");
  }
}

const FieldValues = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(100),
    code: z.string().min(3).max(100),
    activateCodeAt: z.string(), // datetime-local string which does not have tz
    activateCodeAtHidden: z // gmt datetime string, may be empty
      .string()
      .refine((v) => v.length === 0 || !Number.isNaN(Date.parse(v)), {
        message: "Invalid date time",
      })
      .transform((v) => (v.length > 0 ? new Date(v) : null)),
    expireCodeAt: z.string(),
    expireCodeAtHidden: z
      .string()
      .refine((v) => v.length === 0 || !Number.isNaN(Date.parse(v)), {
        message: "Invalid date time",
      })
      .transform((v) => (v.length > 0 ? new Date(v) : null)),
  })
  .strict()
  .refine(
    (v) =>
      !v.activateCodeAtHidden ||
      !v.expireCodeAtHidden ||
      v.expireCodeAtHidden.getTime() > v.activateCodeAtHidden.getTime(),
    {
      message: "Expiration must be later than activation",
      path: ["expireCodeAt"],
    }
  );

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
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
  if (request.method === "DELETE") {
    // await markAccessUserAsDeleted({ id: Number(accessUserId), userId });
    await softDeleteAccessUser({
      access_user_id: Number(accessUserId),
      customer_id: user.id,
      supabaseClient,
    });
    return redirect("/access/users", { headers });
  }

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>({
      formErrors: parseResult.error.formErrors,
      fieldValues,
    });
  }

  //   const { name, description, code, activateCodeAtHidden, expireCodeAtHidden } =
  //     parseResult.data;
  //   await updateAccessUser({
  //     id: Number(accessUserId),
  //     name,
  //     description,
  //     code,
  //     activateCodeAt: activateCodeAtHidden,
  //     expireCodeAt: expireCodeAtHidden,
  //     userId,
  //   });

  const { name, description, code, activateCodeAtHidden, expireCodeAtHidden } =
    parseResult.data;
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "update_access_user",
    {
      access_user_id: Number(accessUserId),
      customer_id: user.id,
      name,
      description,
      code,
      activate_code_at: activateCodeAtHidden
        ? activateCodeAtHidden.toString()
        : "",
      expire_code_at: expireCodeAtHidden ? expireCodeAtHidden.toString() : "",
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  if (data.length !== 1) {
    throw new Error("Invalid access user");
  }

  return redirect(`/access/users/${accessUserId}`, { headers });
};

function formatDatetimeLocal(dt: Date) {
  return `${dt.getFullYear()}-${(dt.getMonth() + 1).toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}-${dt.getDate().toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}T${dt.getHours().toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}:${dt.getMinutes().toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}`;
}

export default function RouteComponent() {
  const { accessUser } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const activateCodeAtErrors =
    actionData?.formErrors?.fieldErrors.activateCodeAt;
  const activateCodeAtHiddenErrors =
    actionData?.formErrors?.fieldErrors.activateCodeAtHidden;
  const activateCodeAtErrorsCombined =
    activateCodeAtErrors || activateCodeAtHiddenErrors
      ? [...(activateCodeAtErrors || []), ...(activateCodeAtHiddenErrors || [])]
      : undefined;
  const expireCodeAtErrors = actionData?.formErrors?.fieldErrors.expireCodeAt;
  const expireCodeAtHiddenErrors =
    actionData?.formErrors?.fieldErrors.expireCodeAtHidden;
  const expireCodeAtErrorsCombined =
    expireCodeAtErrors || expireCodeAtHiddenErrors
      ? [...(expireCodeAtErrors || []), ...(expireCodeAtHiddenErrors || [])]
      : undefined;
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const onConfirm = React.useCallback(() => {
    setConfirmDialogOpen(false);
    submit(null, { method: "delete" });
  }, [submit]);

  return (
    <>
      <PageHeader />
      <main>
        <ConfirmDialog
          open={confirmDialogOpen}
          setOpen={setConfirmDialogOpen}
          onConfirm={onConfirm}
        />
        <Form method="post" className="mx-auto max-w-sm" replace>
          <Form.Header
            title="Access User Settings"
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
                defaultValue={accessUser.name}
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
                defaultValue={accessUser.description}
              />
            </Form.Field>
            <Form.Field
              id="code"
              label="Code"
              errors={actionData?.formErrors?.fieldErrors?.code}
            >
              <input
                type="text"
                name="code"
                id="code"
                defaultValue={accessUser.code}
              />
            </Form.Field>
            <Form.Field
              id="activateCodeAt"
              label="Activate Code At"
              errors={activateCodeAtErrorsCombined}
            >
              <input
                type="datetime-local"
                name="activateCodeAt"
                id="activateCodeAt"
                defaultValue={
                  accessUser.activate_code_at
                    ? formatDatetimeLocal(new Date(accessUser.activate_code_at))
                    : ""
                }
              />
            </Form.Field>
            <Form.Field
              id="expireCodeAt"
              label="Expire Code At"
              errors={expireCodeAtErrorsCombined}
            >
              <input
                type="datetime-local"
                name="expireCodeAt"
                id="expireCodeAt"
                defaultValue={
                  accessUser.expire_code_at
                    ? formatDatetimeLocal(new Date(accessUser.expire_code_at))
                    : ""
                }
              />
            </Form.Field>
            <input
              type="hidden"
              name="activateCodeAtHidden"
              id="activateCodeAtHidden"
            />
            <input
              type="hidden"
              name="expireCodeAtHidden"
              id="expireCodeAtHidden"
            />
          </Form.Body>
          <Form.Footer>
            <Form.DangerButton
              onClick={(e) => {
                setConfirmDialogOpen(true);
                // submit(e.currentTarget.form, { method: "delete" })
              }}
            >
              Delete
            </Form.DangerButton>
            <Form.CancelButton />
            <Form.SubmitButton
              onClick={(e) => {
                const activateCodeAt =
                  e.currentTarget.form?.elements.namedItem("activateCodeAt");
                const activateCodeAtHidden =
                  e.currentTarget.form?.elements.namedItem(
                    "activateCodeAtHidden"
                  );
                if (
                  activateCodeAt &&
                  activateCodeAt instanceof HTMLInputElement &&
                  activateCodeAtHidden &&
                  activateCodeAtHidden instanceof HTMLInputElement
                ) {
                  // input datetime-local does not have timezone so
                  // convert to local time on the client since the server
                  // will not know the correct timezone.
                  activateCodeAtHidden.value = activateCodeAt.value
                    ? new Date(activateCodeAt.value).toJSON()
                    : "";
                }
                const expireCodeAt =
                  e.currentTarget.form?.elements.namedItem("expireCodeAt");
                const expireCodeAtHidden =
                  e.currentTarget.form?.elements.namedItem(
                    "expireCodeAtHidden"
                  );
                if (
                  expireCodeAt &&
                  expireCodeAt instanceof HTMLInputElement &&
                  expireCodeAtHidden &&
                  expireCodeAtHidden instanceof HTMLInputElement
                ) {
                  expireCodeAtHidden.value = expireCodeAt.value
                    ? new Date(expireCodeAt.value).toJSON()
                    : "";
                }
              }}
            >
              Save
            </Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}

function ConfirmDialog({
  open,
  setOpen,
  onConfirm,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
}) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Delete user
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this user? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onConfirm}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
