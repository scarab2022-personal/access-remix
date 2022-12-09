import { redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import type { Database } from "db_types";

export type AppRole = "customer" | "admin";

export function classNames(
  ...classes: (false | null | undefined | string)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export async function requireAppRole({
  request,
  appRole,
}: {
  request: Request;
  appRole: AppRole;
}) {
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
  if (!user || user.user_metadata.appRole !== appRole) {
    throw redirect("/", {
      headers: response.headers, // for set-cookie
    });
  }

  return { user, headers: response.headers, supabaseClient };
}
