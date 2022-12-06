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

-- select * from update_access_hub (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'Hub 1a', 'This is hub 1a');
create or replace function update_access_hub (access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type, name access_hub.name%type, description access_hub.description%type)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        description access_hub.description%type
    )
    as $$
    update
        access_hub
    set name = $3,
        description = $4
    where access_hub_id = $1
        and customer_id = $2
    returning access_hub_id,
        name,
        description;

$$
language sql
security definer set search_path = public, pg_temp;

select *
from update_access_hub (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'Hub 1a', 'This is hub 1a');

select *
from update_access_hub (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'Hub 1', 'This is hub 1');

select *
from update_access_hub (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76f', 'Hub 1a', 'This is hub 1a');

rollback;

