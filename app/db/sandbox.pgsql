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

select *
from get_access_points_by_hubs (array[]::integer[]);

select *
from get_access_points_by_hubs (array[3, 4]);

rollback;

