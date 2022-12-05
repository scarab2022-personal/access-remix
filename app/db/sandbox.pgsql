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

-- select * from get_access_hub (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hub_events (access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type)
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
    order by ae.at desc,
        ae.access_event_id desc
    limit 10;

$$
language sql
security definer set search_path = public, pg_temp;

-- select *
-- from get_access_hub_events (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
\set access_hub_id 3
\set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
\set cursor_id null
select ae.*
from access_event ae
    join access_point ap using (access_point_id)
    join access_hub ah using (access_hub_id)
where ae.access_event_id = :cursor_id
    and ah.access_hub_id = :access_hub_id
    and ah.customer_id = :'customer_id';

select ae.*
from access_event ae
    join access_point ap using (access_point_id)
    join access_hub ah using (access_hub_id)
where ah.access_hub_id = :access_hub_id
    and ah.customer_id = :'customer_id'
order by ae.at desc,
    ae.access_event_id desc
limit 5;

select ae.access_event_id,
    ae.at
from access_event ae
    join access_point ap using (access_point_id)
    join access_hub ah using (access_hub_id)
where ae.access_event_id = :cursor_id
    and ah.access_hub_id = :access_hub_id
    and ah.customer_id = :'customer_id'
union all
select *
from (
    select ae.access_event_id,
        ae.at
    from access_event ae
        join access_point ap using (access_point_id)
        join access_hub ah using (access_hub_id)
    where ah.access_hub_id = :access_hub_id
        and ah.customer_id = :'customer_id'
    order by ae.at desc, ae.access_event_id desc
    limit 1) t
limit 1;

rollback;

