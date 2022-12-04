begin;

create or replace function get_access_points_by_hubs (access_hub_ids int[])
    returns table (
        access_point_id access_point.access_point_id%type,
        name access_point.name%type,
        "position" access_point.position%type,
        access_hub_id access_point.access_hub_id%type,
        access_user_id access_user.access_user_id%type
    )
    as $$
    select ap.access_point_id,
        ap.name,
        ap.position,
        ap.access_hub_id,
        au.access_user_id
    from access_point ap
        join access_point_to_access_user using (access_point_id)
        join access_user au using (access_user_id)
    where access_hub_id = any (access_hub_ids)
        and au.deleted_at is null
    order by access_hub_id,
        position;

$$
language sql
security definer set search_path = public, pg_temp;

drop function get_access_hubs (uuid);

-- select * from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hubs (customer_id uuid)
    returns table(
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        description access_hub.description%type,
        heartbeat_at access_hub.heartbeat_at%type
    )
    as $$
    select access_hub_id, name, description, heartbeat_at
    from access_hub
        join auth.users on id = customer_id
    where customer_id = $1
    order by name;

$$
language sql
security definer set search_path = public, pg_temp;

select *
from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

