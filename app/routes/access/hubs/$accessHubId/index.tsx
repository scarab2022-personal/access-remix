import React, { Fragment } from "react";
import {
  ChevronDownIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { Button } from "~/components/button";
import invariant from "tiny-invariant";
import { classNames, requireAppRole } from "~/utils";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { Table } from "~/components/table";
import type { Database } from "db_types";
import type { SupabaseClient } from "@supabase/supabase-js";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({
  access_hub_id,
  customer_id,
  supabaseClient,
}: Database["public"]["Functions"]["get_access_hub_with_points"]["Args"] & {
  supabaseClient: SupabaseClient<Database>;
}) {
  const { data: mistypedData, error } = await supabaseClient.rpc(
    "get_access_hub_with_points",
    {
      access_hub_id,
      customer_id,
    }
  );
  if (error) throw error;
  // Supabase seems to be adding an extra array dimension.
  const data = mistypedData as unknown as typeof mistypedData[number];

  return { results: data };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(params.accessHubId, "accessHubId not found");
  const data = await getLoaderData({
    access_hub_id: Number(params.accessHubId),
    customer_id: user.id,
    supabaseClient,
  });
  if (data.results.length === 0) {
    throw new Error("Invalid access hub");
  }
  return json<LoaderData>(data, {
    headers, // for set-cookie
  });
};

export default function RouteComponent() {
  const { results } = useLoaderData<LoaderData>();
  const hubResult = results[0];
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={hubResult.name}
        meta={
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPinIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {hubResult.description}
            </div>
          </div>
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
              <Menu.Button as={React.Fragment}>
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
      <main>
        <Section>
          <Section.Header>Access Points</Section.Header>
          <Section.Body>
            <Table
              headers={
                <>
                  <Table.Th>Position</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th sr>View</Table.Th>
                </>
              }
            >
              {results.map((i) => (
                <tr key={i.access_point_id}>
                  <Table.Td>{i.access_point_position}</Table.Td>
                  <Table.Td prominent>{i.access_point_name}</Table.Td>
                  <Table.Td>{i.access_point_description}</Table.Td>
                  <Table.TdLink to={`points/${i.access_point_id}`}>
                    View
                  </Table.TdLink>
                </tr>
              ))}
            </Table>
          </Section.Body>
        </Section>
      </main>
    </>
  );
}
