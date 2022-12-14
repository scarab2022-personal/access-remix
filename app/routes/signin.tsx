import * as Mocks from "~/mocks";
import * as RemixReact from "@remix-run/react"; // after mocks since its mocked
import * as RTL from "@testing-library/react";
import * as React from "react";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { z } from "zod";
import { Form } from "~/components/form";
import type { AuthResponse } from "@supabase/supabase-js";
import type { ZodError } from "zod";

const FieldValues = z
  .object({
    email: z
      .string()
      .min(1)
      .max(50)
      .email()
      .transform((v) => v.toLowerCase()),
    redirectTo: z.string(),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
  authData?: AuthResponse["data"];
  authError?: AuthResponse["error"];
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
  const { email } = parseResult.data;
  const response = new Response();
  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const { data, error } = await supabaseClient.auth.signInWithOtp({
    email,
  });
  if (error) throw error;

  return json<ActionData>(
    { authData: data, authError: error },
    {
      headers: response.headers, // for set-cookie
    }
  );
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign In",
  };
};

function SignInForm() {
  const [searchParams] = RemixReact.useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";
  const actionData = RemixReact.useActionData<ActionData>();
  const emailRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.formErrors?.fieldErrors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post" className="py-8 px-4 sm:px-10" noValidate replace>
      <Form.Header className="align-center flex flex-col">
        <Form.H3 prominent>Sign into your account</Form.H3>
        <Form.P prominent>
          Or{" "}
          <RemixReact.Link
            to={{
              pathname: "/signup",
              search: searchParams.toString(),
            }}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            sign up here
          </RemixReact.Link>
        </Form.P>
      </Form.Header>

      {actionData?.formErrors?.formErrors ? (
        <Form.Errors
          id="form-errors"
          role="alert"
          errors={actionData.formErrors.formErrors}
        />
      ) : null}
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
        <input type="hidden" name="redirectTo" value={redirectTo} />
      </Form.Body>
      <Form.Footer>
        <Form.SubmitButton wide>Sign in</Form.SubmitButton>
      </Form.Footer>
    </Form>
  );
}

export default function SignInRoute() {
  // const [searchParams] = useSearchParams();
  // const redirectTo = searchParams.get("redirectTo") || "/access/dashboard";
  // const redirectTo = searchParams.get("redirectTo") || "";
  // const loaderData = useLoaderData();
  const actionData = RemixReact.useActionData<ActionData>();

  // Simple card
  // https://tailwindui.com/components/application-ui/forms/sign-in-forms
  // <html class="h-full bg-gray-50">
  // <body class="h-full">
  return (
    <div className="flex min-h-full flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {actionData?.authData ? (
          <div className="text-center pt-8">Check your email for the sign in link.</div>
        ) : (
          <SignInForm />
        )}
      </div>
    </div>
  );
}

if (import.meta.vitest) {
  vi.mock("@remix-run/react", () =>
    Mocks.createRemixReactMock({ path: "/sigin" })
  );
  const RemixReactMock = RemixReact as unknown as ReturnType<
    typeof Mocks.createRemixReactMock
  >;

  it("renders", () => {
    RemixReactMock.useSearchParams.mockReturnValue([new URLSearchParams()]);
    RTL.render(<SignInRoute />);
    RTL.screen.debug();
    expect(
      RTL.screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });
}
