begin;

-- \set accessHubIds 3, 4
-- \set accessHubIds 2
select access_point.*
from access_point
where access_hub_id in (:accessHubIds);

create or replace function get_access_points_by_hubs (access_hub_ids int[])
    returns table (
        access_point_id int,
        name text,
        description text,
        "position" integer,
        access_hub_id integer,
        access_user_id integer)
    security definer
    set search_path = public,
    pg_temp
    as $$
    select ap.access_point_id,
        ap.name,
        ap.description,
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
language sql;

select *
from get_access_points_by_hubs ('{3, 4}');

-- select *
-- from get_access_points_by_hubs (array[1, 2]);
-- select *
-- from get_access_points_by_hubs (array[]::integer[]);
rollback;

