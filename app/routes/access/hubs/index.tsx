import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { StackedList } from "~/components/stacked-list";
import { PageHeader } from "~/components/page-header";
import { Badge } from "~/components/badge";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "db_types";
import { createServerClient } from "@supabase/auth-helpers-remix";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

// function getLoaderData({ userId }: { userId: User["id"] }) {
//   return prisma.accessHub.findMany({
//     where: {
//       user: { id: userId },
//     },
//     orderBy: { name: "asc" },
//   });
// }

async function getLoaderData(
  { customerId }: { customerId: User["id"] },
  supabaseClient: SupabaseClient<Database>
) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_hubs",
    {
      customer_id: customerId,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { accessHubs: data };
}

// export const loader: LoaderFunction = async ({ request }) => {
//   const userId = await requireUserIdForRole(request, "customer");
//   const accessHubs = await getLoaderData({ userId });
//   return json<LoaderData>({ accessHubs });
// };

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
  console.log({ data });

  return json<LoaderData>(data, {
    headers: response.headers, // for set-cookie
  });
};

export default function RouteComponent() {
  const { accessHubs } = useLoaderData<LoaderData>();

  // With right-justified second column
  // https://tailwindui.com/components/application-ui/lists/stacked-lists
  return (
    <>
      <PageHeader title="Hubs" />
      <main>
        <StackedList.Chrome className="mx-auto max-w-2xl">
          <StackedList>
            {accessHubs.map((i) => (
              <li key={i.access_hub_id}>
                <StackedList.Link to={`${i.access_hub_id}`}>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">
                      {i.name}
                    </p>
                    <Badge color="green">ACTIVE</Badge>
                  </div>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPinIcon
                      className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    {i.description}
                  </p>
                </StackedList.Link>
              </li>
            ))}
          </StackedList>
        </StackedList.Chrome>
      </main>
    </>
  );
}
