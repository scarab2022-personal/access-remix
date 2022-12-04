import * as R from "remeda";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "db_types";
import React from "react";
import { PageHeader } from "~/components/page-header";
import { Switch } from "~/components/switch";

// export const loader = (async () => {
//   return json({ data: "some data" });
// }) satisfies  LoaderFunction;

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

/*
 access_hub_id │ name  │ heartbeat_at │ access_point_id │ access_point_name │ access_point_position │ grant │ deny 
═══════════════╪═══════╪══════════════╪═════════════════╪═══════════════════╪═══════════════════════╪═══════╪══════
             ¤ │ ¤     │ ¤            │               ¤ │ ¤                 │                     ¤ │    36 │    9
             3 │ Hub 1 │ ¤            │               ¤ │ ¤                 │                     ¤ │    20 │    5
             3 │ Hub 1 │ ¤            │               9 │ Point 1           │                     1 │     4 │    2
             3 │ Hub 1 │ ¤            │              10 │ Point 2           │                     2 │     5 │    1
             3 │ Hub 1 │ ¤            │              11 │ Point 3           │                     3 │     6 │    1
             3 │ Hub 1 │ ¤            │              12 │ Point 4           │                     4 │     5 │    1
             4 │ Hub 2 │ ¤            │               ¤ │ ¤                 │                     ¤ │    16 │    4
             4 │ Hub 2 │ ¤            │              13 │ Point 1           │                     1 │     8 │    1
             4 │ Hub 2 │ ¤            │              14 │ Point 2           │                     2 │     5 │    1
             4 │ Hub 2 │ ¤            │              15 │ Point 3           │                     3 │     1 │    1
             4 │ Hub 2 │ ¤            │              16 │ Point 4           │                     4 │     2 │    1
*/

async function getLoaderData(
  { customerId }: { customerId: User["id"] },
  supabaseClient: SupabaseClient<Database>
) {
  const { data: mistypedData, error: statsError } = await supabaseClient.rpc(
    "get_grant_deny_stats",
    {
      customer_id: customerId,
    }
  );
  if (statsError) throw statsError;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];
  type Row = typeof data[number];
  type Stats = {
    grant: Row["grant"],
    deny: Row["deny"],
    hubs: Array<
      Pick<
        Row,
        "access_hub_id" | "name" | "heartbeat_at" | "grant" | "deny"
      > & {
        points: Array<
          Pick<
            Row,
            | "access_point_id"
            | "access_point_name"
            | "access_point_position"
            | "grant"
            | "deny"
          >
        >;
      }
    >;
  };

  const stats = data.reduce<Stats>(
    (acc, v) => {
      if (v.access_hub_id === null) {
        return { ...acc, ...R.pick(v, ["grant", "deny"]) };
      } else if (v.access_point_id === null) {
        return {
          ...acc,
          hubs: [
            ...acc.hubs,
            {
              ...R.pick(v, [
                "access_hub_id",
                "name",
                "heartbeat_at",
                "grant",
                "deny",
              ]),
              points: [],
            },
          ],
        };
      }
      acc.hubs
        .at(-1)!
        .points.push(
          R.pick(v, [
            "access_point_id",
            "access_point_name",
            "access_point_position",
            "grant",
            "deny",
          ])
        );
      return acc;
    },
    { grant: 0, deny: 0, hubs: [] }
  );

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
  const poll = useFetcher<LoaderData>();
  const [isPolling, setIsPolling] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    if (isPolling) {
      const intervalId = setInterval(() => poll.load(location.pathname), 5000);
      return () => clearInterval(intervalId);
    }
  }, [location, isPolling, poll]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        side={
          <Switch.Group>
            <Switch checked={isPolling} onChange={setIsPolling} />
            <Switch.Label className="ml-3">Poll</Switch.Label>
          </Switch.Group>
        }
      />
      <main className=" space-y-8">
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      </main>
    </>
  );
}
