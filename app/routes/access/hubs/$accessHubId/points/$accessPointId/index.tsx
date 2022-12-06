import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  useNavigate,
  useSubmit,
  useFormAction,
} from "@remix-run/react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Fragment } from "react";
import { Button } from "~/components/button";
import invariant from "tiny-invariant";
import { classNames, requireAppRole } from "~/utils";
import { PageHeader } from "~/components/page-header";
import { Table } from "~/components/table";
import { Section } from "~/components/section";
import { DescriptionList } from "~/components/description-list";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "db_types";
import { result } from "lodash";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

/*
─[ RECORD 1 ]───────────┬────────
access_point_id         │ 9
name                    │ Point 1
description             │ 
position                │ 1
access_hub_name         │ Hub 1
access_user_id          │ ¤
access_user_name        │ ¤
access_user_description │ ¤
access_user_code        │ ¤

─[ RECORD 1 ]───────────┬────────
access_point_id         │ 9
name                    │ Point 1
description             │ 
position                │ 1
access_hub_name         │ Hub 1
access_user_id          │ 5
access_user_name        │ guest1
access_user_description │ 
access_user_code        │ 111
*/

async function getLoaderData({
  access_point_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_point_with_hub_and_users"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_point_with_hub_and_users",
    {
      access_point_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { results: data };
}

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessPointId, "accessPointId not found");

  const data = await getLoaderData({
    access_point_id: Number(accessPointId),
    customer_id: user.id,
    supabaseClient,
  });
  if (data.results.length === 0) {
    throw new Error("Invalid access point");
  }
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

export default function RouteComponent() {
  const { results } = useLoaderData<LoaderData>();
  const accessPoint = results[0];
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("users");
  return (
    <>
      <PageHeader
        title={accessPoint.name}
        meta={
          accessPoint.description ? (
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPinIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {accessPoint.description}
              </div>
            </div>
          ) : null
        }
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="sm:ml-3">
              <Button onClick={() => navigate("edit")}>
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit
              </Button>
            </span>

            {/* Dropdown */}
            <Menu as="span" className="relative ml-3 sm:hidden">
              <Menu.Button as={Fragment}>
                <Button variant="white">
                  More
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Button>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="raw"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Raw
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="activity"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Activity
                      </Link>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </>
        }
      />
      <main className="space-y-6">
        <div className="mx-auto max-w-lg">
          <DescriptionList>
            <DescriptionList.Item
              term="Hub"
              description={accessPoint.access_hub_name}
            />
            <DescriptionList.Item
              term="ID"
              description={accessPoint.access_point_id.toString()}
            />
            <DescriptionList.Item
              term="Position"
              description={accessPoint.position.toString()}
            />
            <DescriptionList.Item
              term="Description"
              description={accessPoint.description}
            />
          </DescriptionList>
        </div>
        <Section>
          <Section.Header
            side={<Button onClick={() => navigate("users/add")}>Add</Button>}
          >
            Users With Access
          </Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th sr>View</Table.Th>
              </>
            }
          >
            {(results[0].access_user_id ? results : results.slice(1)).map(
              (i) => (
                <tr key={i.access_user_id}>
                  <Table.Td prominent>{i.access_user_name}</Table.Td>
                  <Table.Td>{i.access_user_description}</Table.Td>
                  <Table.Td>{i.access_user_code}</Table.Td>
                  <Table.TdLink
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      submit(null, {
                        method: "post",
                        action: `${removeFormActionBase}/${i.access_user_id}/remove`,
                      });
                    }}
                  >
                    Remove
                  </Table.TdLink>
                </tr>
              )
            )}
          </Table>
        </Section>
      </main>
    </>
  );
}
