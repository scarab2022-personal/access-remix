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

select *
from get_access_hub_events (3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', null, 5);

rollback;

