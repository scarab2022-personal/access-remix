-- select * from get_access_hub (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hub (access_hub_id integer, customer_id uuid)
    returns access_hub
    as $$
    select access_hub.*
    from access_hub
        join auth.users on id = customer_id
    where access_hub_id = get_access_hub.access_hub_id
        and customer_id = get_access_hub.customer_id;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hubs (customer_id uuid)
    returns setof access_hub
    as $$
    select access_hub.*
    from access_hub
        join auth.users on id = customer_id
    where customer_id = get_access_hubs.customer_id
    order by name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_grant_deny_stats ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_grant_deny_stats (customer_id uuid)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        heartbeat_at access_hub.heartbeat_at%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type,
        access_point_position access_point.position%type,
        "grant" bigint,
        deny bigint,
        "grouping" integer
    )
    as $$
    select ah.access_hub_id,
        ah.name,
        ah.heartbeat_at,
        ap.access_point_id,
        ap.name,
        ap.position,
        count(*) filter (where ae.access = 'grant') as "grant",
        count(*) filter (where ae.access = 'deny') as deny,
        grouping (ah.access_hub_id, ah.name, ah.heartbeat_at, ap.access_point_id, ap.name, ap.position)
    from access_hub ah
        join access_point ap using (access_hub_id)
        join access_event ae using (access_point_id)
    where customer_id = $1
    group by rollup ((ah.access_hub_id, ah.name, ah.heartbeat_at), (ap.access_point_id, ap.name, ap.position))
    order by grouping desc,
        ah.name,
        ap.position;

$$
language sql
security definer set search_path = public, pg_temp;

