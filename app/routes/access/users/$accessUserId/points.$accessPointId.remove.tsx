import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireAppRole } from "~/lib";

export const action: ActionFunction = async ({
  request,
  params: { accessUserId, accessPointId },
}) => {
  const { user, headers, supabaseClient } = await requireAppRole({
    request,
    appRole: "customer",
  });
  invariant(accessUserId, "accessUserId not found");
  invariant(accessPointId, "accessPointId not found");
  const { error } = await supabaseClient.rpc(
    "disconnect_access_points_and_users",
    {
      access_point_ids: [Number(accessPointId)],
      access_user_ids: [Number(accessUserId)],
      customer_id: user.id,
    }
  );
  if (error) throw error;
  return redirect(`/access/users/${accessUserId}`, { headers });
};
