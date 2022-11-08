import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const { error } = await supabaseClient.auth.signOut();

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { error },
    {
      headers: response.headers,
    }
  );
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
