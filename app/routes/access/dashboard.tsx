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
  const { data, error } = await supabaseClient.rpc("get_access_hubs", {
    customer_id: customerId,
  });
  console.log({ data, error });
  // const accessHubs = await getAccessHubs.run({ customerId }, pgTypedClient);
  return { accessHubs: data };
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
  console.log(data);

  return json<LoaderData>(data, {
    headers: response.headers, // for set-cookie
  });
};

export default function RouteComponent() {
  // const {data} = useLoaderData<typeof loader>();
  const { accessHubs } = useLoaderData<LoaderData>();
  return (
    <div>
      <div>Access Dashboard</div>
      <pre>{JSON.stringify(accessHubs, null, 2)}</pre>
    </div>
  );
}
