import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "db_types";

// export const loader = (async () => {
//   return json({ data: "some data" });
// }) satisfies  LoaderFunction;

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData(
  { customerId }: { customerId: User["id"] },
  supabaseClient: SupabaseClient<Database>
) {
  const { data: stats, error: statsError } = await supabaseClient.rpc(
    "get_grant_deny_stats",
    {
      customer_id: customerId,
    }
  );
  if (statsError) throw statsError;

  return { stats };
}

export const loader: LoaderFunction = async ({
  request,
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
    data: { session },
  } = await supabaseClient.auth.getSession();

  const user = session?.user;
  if (!user) {
    return redirect("/", {
      headers: response.headers, // for set-cookie
    });
  }

  const data = await getLoaderData({ customerId: user.id }, supabaseClient);

  return json<LoaderData>(data, {
    headers: response.headers, // for set-cookie
  });
};

export default function RouteComponent() {
  const { stats } = useLoaderData<LoaderData>();
  return (
    <div>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}
