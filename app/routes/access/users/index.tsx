import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/button";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { StackedList } from "~/components/stacked-list";
import { PageHeader } from "~/components/page-header";
import { Badge } from "~/components/badge";
import { requireAppRole } from "~/utils";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "db_types";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

function codeActivateExpireStatus(
  accessUser: LoaderData["accessUsers"][number]
) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activate_code_at = accessUser.activate_code_at
    ? new Date(accessUser.activate_code_at)
    : null;
  const expire_code_at = accessUser.expire_code_at
    ? new Date(accessUser.expire_code_at)
    : null;
  const now = Date.now();

  const codeStatus: "PENDING" | "ACTIVE" | "EXPIRED" =
    expire_code_at && now > expire_code_at.getTime()
      ? "EXPIRED"
      : activate_code_at && now < activate_code_at.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expire_code_at
        ? `Will expire at ${expire_code_at.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expire_code_at
        ? `Will activate at ${activate_code_at?.toLocaleString()} until ${expire_code_at.toLocaleString()}.`
        : `Will activate at ${activate_code_at?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

const codeStatusColors = {
  PENDING: "yellow",
  ACTIVE: "green",
  EXPIRED: "red",
} as const;

async function getLoaderData({
  customerId,
  supabaseClient,
}: {
  customerId: User["id"];
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_users",
    {
      customer_id: customerId,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { accessUsers: data };
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  const data = await getLoaderData({ customerId: user.id, supabaseClient });
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  // With right-justified second column
  // https://tailwindui.com/components/application-ui/lists/stacked-lists
  return (
    <>
      <PageHeader
        title="Users"
        side={<Button onClick={() => navigate("create")}>Create</Button>}
      />
      <main>
        <StackedList.Chrome className="mx-auto max-w-2xl">
          <StackedList>
            {accessUsers.map((i) => {
              const { codeStatus, activateExpireStatus } =
                codeActivateExpireStatus(i);
              return (
                <li key={i.access_user_id}>
                  <StackedList.Link to={`${i.access_user_id}`}>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-indigo-600">
                        {i.name}
                      </p>
                      <Badge color={codeStatusColors[codeStatus]}>
                        {codeStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <p className="mt-2 flex items-center ">
                        <MapPinIcon
                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        {i.code}
                      </p>
                      <p className="mt-2 hidden md:block">
                        {activateExpireStatus}
                      </p>
                    </div>
                  </StackedList.Link>
                </li>
              );
            })}
          </StackedList>
        </StackedList.Chrome>
      </main>
    </>
  );
}
