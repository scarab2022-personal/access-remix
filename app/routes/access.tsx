import type { useMatches } from "@remix-run/react";
import { useOutletContext } from "@remix-run/react";
import { Link, Outlet } from "@remix-run/react";
import {
  GenericCatchBoundary,
  GenericErrorBoundary,
} from "~/components/boundaries";
import { HomeIcon } from "@heroicons/react/24/solid";
import { Nav } from "~/components/Nav";
import { Container } from "~/components/container";
import type { ContextType } from "~/root";

export const handle = {
  breadcrumb: (match: ReturnType<typeof useMatches>[number]) => (
    // Don't link to match.pathname.
    <Link to="/" className="text-gray-400 hover:text-gray-500">
      <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="sr-only">Home</span>
    </Link>
  ),
};

const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
];
export const navigation = [
  { name: "Dashboard", href: "dashboard" },
  { name: "Users", href: "users" },
  { name: "Hubs", href: "hubs" },
];

function Layout({ children }: { children: React.ReactNode }) {
  const { supabase, session } = useOutletContext<ContextType>();

  // With page heading and stacked list
  // https://tailwindui.com/components/application-ui/page-examples/detail-screens
  return (
    <Container className="min-h-full pb-8">
      <Nav
        navigation={navigation}
        userNavigation={userNavigation}
        user={session?.user!}
        supabase={supabase!}
      />
      {children}
    </Container>
  );
}

export default function RouteComponent() {
  const { session } = useOutletContext<ContextType>();

  return session ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : null;
}

export function CatchBoundary() {
  return (
    <Layout>
      <GenericCatchBoundary />
    </Layout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Layout>
      <GenericErrorBoundary error={error} />
    </Layout>
  );
}
