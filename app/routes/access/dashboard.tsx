import type {
  LoaderFunction} from "@remix-run/node";
import {
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import type { User } from "@supabase/supabase-js";
import type { Database } from "db_types";

// export const loader = (async () => {
//   return json({ data: "some data" });
// }) satisfies  LoaderFunction;

export const loader: LoaderFunction = async ({
  request
}: {
  request: Request;
}) => {
  const response = new Response();

  const supabaseClient = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  const user = session?.user;

  if (!user) {
    // there is no user, therefore, we are redirecting
    // to the landing page. we still need to return
    // response.headers to attach the set-cookie header
    return redirect('/', {
      headers: response.headers
    });
  }

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { user },
    {
      headers: response.headers
    }
  );
};

export default function RouteComponent() {
  // const {data} = useLoaderData<typeof loader>();
  const { user } = useLoaderData<{ user: User }>();
  return (
    <div>
      <div>Access Dashboard</div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
