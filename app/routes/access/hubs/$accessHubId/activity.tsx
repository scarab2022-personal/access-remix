import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { Button } from "~/components/button";
import { useEffect, useState } from "react";
import { StackedList } from "~/components/stacked-list";
import { Badge } from "~/components/badge";
import { requireAppRole } from "~/lib";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "db_types";

export const handle = {
  breadcrumb: "Activity",
};

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  access_hub_id,
  customer_id,
  cursor_id,
  take,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_hub_events"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedHubResults, error: hubError } =
    await supabaseClient.rpc("get_access_hub", { access_hub_id, customer_id });
  if (hubError) throw hubError;
  // Supabase seems to be adding an extra array dimension.
  const hubResults =
    mistypedHubResults as unknown as typeof mistypedHubResults[number];
  if (hubResults.length !== 1) {
    throw new Error("Invalid access hub");
  }

  const { data: mistypedAccessEvents, error: accessEventsError } =
    await supabaseClient.rpc("get_access_hub_events", {
      access_hub_id,
      customer_id,
      cursor_id: cursor_id > 0 ? cursor_id : (null as unknown as number), //hack
      take,
    });
  if (accessEventsError) throw accessEventsError;
  // Supabase seems to be adding an extra array dimension.
  const accessEvents =
    mistypedAccessEvents as unknown as typeof mistypedAccessEvents[number];

  return {
    accessHub: hubResults[0],
    accessEvents,
    cursorId:
      accessEvents.length === take
        ? accessEvents.at(-1)?.access_event_id
        : undefined,
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(params.accessHubId, "accessHubId not found");
  const url = new URL(request.url);
  const cursorIdString = url.searchParams.get("cursorId");
  const cursorId = Number(cursorIdString);
  const data = await getLoaderData({
    access_hub_id: Number(params.accessHubId),
    customer_id: user.id,
    cursor_id: cursorId,
    take: 10,
    supabaseClient,
  });
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

// https://news.ycombinator.com/item?id=30376689
export default function RouteComponent() {
  const { accessHub, ...data } = useLoaderData<LoaderData>();
  const [accessEvents, setAccessEvents] = useState<LoaderData["accessEvents"]>(
    data.accessEvents
  );
  const [cursorId, setCursorId] = useState<LoaderData["cursorId"]>(
    data.cursorId
  );
  // const transition = useTransition();
  const fetcher = useFetcher<LoaderData>();
  const location = useLocation();

  useEffect(() => {
    const data = fetcher.data;
    if (data) {
      setAccessEvents((prev) => [...prev, ...data.accessEvents]);
      setCursorId(data.cursorId);
    }
  }, [fetcher.data]);

  return (
    <>
      <PageHeader title={accessHub.name} />
      <main>
        <Section>
          <Section.Header>Activity</Section.Header>
          <Section.Body>
            <StackedList className="mx-auto max-w-sm">
              {accessEvents.map((i) => (
                <li key={i.access_event_id} className="p-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">
                      {i.access_point_name}
                    </p>
                    <Badge
                      className="uppercase"
                      color={
                        i.access.toUpperCase() === "DENY" ? "red" : "green"
                      }
                    >
                      {i.access}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <p>{new Date(i.at).toLocaleString()}</p>
                    <p className="truncate">
                      {i.access_user_name ? i.access_user_name : i.code}
                    </p>
                  </div>
                </li>
              ))}
            </StackedList>
          </Section.Body>
          {cursorId ? (
            <Section.Footer className="mx-auto flex max-w-sm">
              <Button
                className="ml-auto"
                disabled={fetcher.state !== "idle"}
                onClick={() => {
                  fetcher.load(`${location.pathname}?cursorId=${cursorId}`);
                }}
              >
                More
              </Button>
            </Section.Footer>
          ) : undefined}
        </Section>
      </main>
    </>
  );
}
