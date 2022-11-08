import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import type { ContextType } from "~/root";

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return json(
    { dt: new Date(), data },
    {
      headers: response.headers,
    }
  );
};

export default function Index() {
  const loaderData = useLoaderData();
  const { supabase, session } = useOutletContext<ContextType>();
  // const submit = useSubmit();
  const navigate = useNavigate();
  return (
    <div className="min-h-full mx-auto max-w-sm p-8">
      <h1 className="text-gray-500 text-center">Welcome to Access</h1>
      <div className="flex justify-between mt-3">
        <Link to="login">Login</Link>
        <Link
          to="logout"
          // onClick={(e) => {
          //   e.preventDefault();
          //   submit(null, {
          //     action: "/logout",
          //     method: "post",
          //   });
          // }}
          onClick={async (e) => {
            e.preventDefault();
            await supabase?.auth.signOut();
            navigate("/");
          }}
        >
          Logout
        </Link>
      </div>
      <pre className="mt-3">
        {JSON.stringify({ loaderData, session }, null, 2)}
      </pre>
    </div>
  );
}
