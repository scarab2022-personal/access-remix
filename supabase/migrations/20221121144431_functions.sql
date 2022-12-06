-- select * from get_access_hub (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hub (access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        description access_hub.description%type,
        heartbeat_at access_hub.heartbeat_at%type
    )
    as $$
    select access_hub_id,
        name,
        description,
        heartbeat_at
    from access_hub
    where access_hub_id = $1
        and customer_id = $2;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_hub_events (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', null, 5);
create or replace function get_access_hub_events (access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type, cursor_id access_event.access_event_id%type, take integer)
    returns table (
        access_event_id access_event.access_event_id%type,
        at access_event.at%type,
        access access_event.access%type,
        code access_event.code%type,
        access_user_name access_user.name%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type
    )
    as $$
    with cursor as (
        select ae.access_event_id,
            ae.at
        from access_event ae
            join access_point ap using (access_point_id)
            join access_hub ah using (access_hub_id)
        where ae.access_event_id = $3
            and ah.access_hub_id = $1
            and ah.customer_id = $2
        union all
        select *
        from (
            select ae.access_event_id, ae.at
            from access_event ae
                join access_point ap using (access_point_id)
                join access_hub ah using (access_hub_id)
            where $3 is null
                and ah.access_hub_id = $1
                and ah.customer_id = $2
            order by ae.at desc, ae.access_event_id desc
            limit 1) t
)
select ae.access_event_id,
    ae.at,
    ae.access,
    ae.code,
    au.name,
    ap.access_point_id,
    ap.name
from access_event ae
    join access_point ap using (access_point_id)
    join access_hub ah using (access_hub_id)
    left join access_user au using (access_user_id)
where ah.access_hub_id = $1
    and ah.customer_id = $2
    and exists (
        select 1
        from cursor c
        where (ae.at <= c.at)
        or ((ae.at = c.at)
            and (ae.access_event_id < c.access_event_id)))
order by ae.at desc,
    ae.access_event_id desc
limit $4;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_hub_with_points (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hub_with_points (access_hub_id integer, customer_id uuid)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        description access_hub.description%type,
        heartbeat_at access_hub.heartbeat_at%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type,
        access_point_description access_point.description%type,
        access_point_position access_point.position%type
    )
    as $$
    select ah.access_hub_id,
        ah.name,
        ah.description,
        ah.heartbeat_at,
        ap.access_point_id,
        ap.name,
        ap.description,
        ap.position
    from access_hub ah
        join access_point ap using (access_hub_id)
    where ah.access_hub_id = $1
        and ah.customer_id = $2
    order by ap.position
$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hubs (customer_id uuid)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        description access_hub.description%type,
        heartbeat_at access_hub.heartbeat_at%type
    )
    as $$
    select access_hub_id,
        name,
        description,
        heartbeat_at
    from access_hub
    where customer_id = $1
    order by name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_grant_deny_stats ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
-- order by is important for gui rendering
create or replace function get_grant_deny_stats (customer_id uuid)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        heartbeat_at access_hub.heartbeat_at%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type,
        access_point_position access_point.position%type,
        "grant" bigint,
        deny bigint
    )
    as $$
    select ah.access_hub_id,
        ah.name,
        ah.heartbeat_at,
        ap.access_point_id,
        ap.name,
        ap.position,
        count(*) filter (where ae.access = 'grant') as "grant",
        count(*) filter (where ae.access = 'deny') as deny
    from access_hub ah
        join access_point ap using (access_hub_id)
        join access_event ae using (access_point_id)
    where customer_id = $1
    group by rollup ((ah.access_hub_id, ah.name, ah.heartbeat_at), (ap.access_point_id, ap.name, ap.position))
    order by ah.name nulls first,
        ap.position nulls first;

$$
language sql
security definer set search_path = public, pg_temp;

