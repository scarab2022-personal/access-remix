import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import type { ZodError } from "zod";
import { z } from "zod";
import { Form } from "~/components/form";

const FieldValues = z
  .object({
    email: z
      .string()
      .min(1)
      .max(50)
      .email()
      .transform((v) => v.toLowerCase()),
    password: z.string().min(8).max(50),
    redirectTo: z.string(),
  })
  .strict();

export const loader: LoaderFunction = async ({ request }) => {
  // const userId = await getUserId(request);
  // if (userId) return redirect("/");
  return json({});
};

type ActionData = {
  formErrors?: ZodError["formErrors"];
};

export const action: ActionFunction = async ({ request }) => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>(
      {
        formErrors: parseResult.error.formErrors,
      },
      { status: 400 }
    );
  }
  const { email, password, redirectTo } = parseResult.data;
  // const existingUser = await getUserByEmail(email);
  // if (existingUser) {
  //   return json<ActionData>(
  //     {
  //       formErrors: {
  //         formErrors: [],
  //         fieldErrors: {
  //           email: ["A user already exists with this email"],
  //         },
  //       },
  //     },
  //     { status: 400 }
  //   );
  // }

  // const user = await createUser(email, password, "customer");
  // return createUserSession({
  //   request,
  //   userId: user.id,
  //   remember: false,
  //   redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  // });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.formErrors?.fieldErrors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.formErrors?.fieldErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  // Simple card
  // https://tailwindui.com/components/application-ui/forms/sign-in-forms
  // <html class="h-full bg-gray-50">
  // <body class="h-full">
  return (
    <div className="flex min-h-full flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Form method="post" className="py-8 px-4 sm:px-10" noValidate replace>
          <Form.Header className="align-center flex flex-col">
            <Form.H3 prominent>Sign up for an account</Form.H3>
            <Form.P prominent>
              Or{" "}
              <Link
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                log in here
              </Link>
            </Form.P>
          </Form.Header>
          <Form.Body>
            <Form.Field
              id="email"
              label="Email"
              errors={actionData?.formErrors?.fieldErrors?.email}
            >
              <input
                ref={emailRef}
                type="email"
                name="email"
                id="email"
                // required
                autoFocus={true}
                autoComplete="email"
              />
            </Form.Field>
            <Form.Field
              id="password"
              label="Password"
              errors={actionData?.formErrors?.fieldErrors?.password}
            >
              <input
                ref={passwordRef}
                type="password"
                name="password"
                id="password"
                required
                autoFocus={true}
                autoComplete="current-password"
              />
            </Form.Field>
            <input type="hidden" name="redirectTo" value={redirectTo} />
          </Form.Body>
          <Form.Footer>
            <Form.SubmitButton wide>Sign up</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </div>
    </div>
  );
}
