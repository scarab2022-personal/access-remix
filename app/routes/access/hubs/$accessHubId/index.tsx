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
import { classNames } from "~/utils";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { Table } from "~/components/table";

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHubWithPoints>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(params.accessHubId, "accessHubId not found");
  const accessHub = await getAccessHubWithPoints({
    id: params.accessHubId,
    userId,
  });
  return json<LoaderData>({ accessHub });
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={accessHub.name}
        meta={
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPinIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {accessHub.description}
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
              {accessHub.accessPoints.map((i) => (
                <tr key={i.id}>
                  <Table.Td>{i.position}</Table.Td>
                  <Table.Td prominent>{i.name}</Table.Td>
                  <Table.Td>{i.description}</Table.Td>
                  <Table.TdLink to={`points/${i.id}`}>View</Table.TdLink>
                </tr>
              ))}
            </Table>
          </Section.Body>
        </Section>
      </main>
    </>
  );
}
