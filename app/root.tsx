import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import {
  createBrowserClient,
  createServerClient,
} from "@supabase/auth-helpers-remix";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import type { Database } from "../db_types";
import { useEffect, useState } from "react";

export type ContextType = {
  supabase: SupabaseClient<Database> | null;
  session: Session | null;
};

export const loader = (async ({ request }) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (SUPABASE_URL === undefined || SUPABASE_ANON_KEY === undefined) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY env vars undefined");
  }

  // We can retrieve the session on the server and hand it to the client.
  // This is used to make sure the session is available immediately upon rendering
  const response = new Response();
  const supabaseClient = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    { request, response }
  );
  const {
    data: { session: initialSession },
  } = await supabaseClient.auth.getSession();

  return json(
    {
      initialSession,
      env: {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
      },
    },
    {
      headers: response.headers, // for set-cookie
    }
  );
}) satisfies LoaderFunction;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Access Remix",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const { env, initialSession } = useLoaderData<typeof loader>();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const context: ContextType = { supabase, session };

  useEffect(() => {
    if (!supabase) {
      const supabaseClient = createBrowserClient<Database>(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY
      );
      setSupabase(supabaseClient);
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log({ auth: "onAuthStateChange", event, session });
        setSession(session);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={context} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
