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

create or replace function get_hubs_with_stats (customer_id uuid)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type,
        access_point_position access_point.position%type,
        "grant" bigint,
        deny bigint
    )
    as $$
    select ah.access_hub_id,
        ah.name,
        ap.access_point_id,
        ap.name,
        ap.position,
        count(*) filter (where ae.access = 'grant') as "grant",
        count(*) filter (where ae.access = 'deny') as deny
    from access_hub ah
        join access_point ap using (access_hub_id)
        join access_event ae using (access_point_id)
    where customer_id = $1
    group by ah.access_hub_id,
        ap.access_point_id
    order by ah.name,
        ap.position;

$$
language sql
security definer set search_path = public, pg_temp;

-- select *
-- from get_access_points_by_hubs (array[]::integer[]);
-- select *
-- from get_access_points_by_hubs (array[3, 4]);
select *
from get_hubs_with_stats ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

