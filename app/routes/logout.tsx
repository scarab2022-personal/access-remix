import type { ActionFunction, LoaderFunction } from "@remix-run/node";
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
  if (error) throw error;

  return redirect("/", {
    headers: response.headers,
  });
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
