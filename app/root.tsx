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
  useNavigate,
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

type LoaderData = {
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string };
  initialSession: Session | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  // environment variables may be stored somewhere other than
  // `process.env` in runtimes other than node
  // we need to pipe these Supabase environment variables to the browser
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

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json<LoaderData>(
    {
      initialSession,
      env: {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
      },
    },
    {
      headers: response.headers,
    }
  );
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const { env, initialSession } = useLoaderData<LoaderData>();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const navigate = useNavigate();
  const context: ContextType = { supabase, session };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    if (!supabase) return;
    const formData = new FormData(event.currentTarget);
    const email = formData.get("loginEmail") as string;

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      console.log({ auth: "signInWithOtp", email, error });
      if (error) throw error;
      alert("Check your email for the login link!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`${error.name}: ${error.message}`);
      }
    }
  };

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
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {session && (
          <button
            onClick={async () => {
              await supabase?.auth.signOut();
              navigate("/");
            }}
          >
            Logout
          </button>
        )}
        {supabase && !session && (
          <form onSubmit={handleSubmit}>
            <h1>Login form:</h1>
            <div>
              <label htmlFor="loginEmail">Email:</label>
              <input type="text" id="loginEmail" name="loginEmail" required />
            </div>
            <button type="submit">Login</button>
          </form>
        )}
        <Outlet context={context} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
