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

create or replace function get_access_hub_with_points (access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type)
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
-- select * from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_hubs (customer_id auth.users.id%type)
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

-- select * from update_access_point (9, 3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'Point 1a', 'This is the first point');
create or replace function update_access_point (access_point_id access_point.access_point_id%type, access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type, name access_point.name%type, description access_point.description%type)
    returns table (
        access_point_id access_point.access_point_id%type,
        name access_point.name%type,
        description access_point.description%type
    )
    as $$
    update
        access_point ap
    set name = $4,
        description = $5
    from access_hub ah
    where ap.access_point_id = $1
        and ap.access_hub_id = $2
        and ap.access_hub_id = ah.access_hub_id
        and ah.customer_id = $3
    returning ap.access_point_id,
        ap.name,
        ap.description;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_point(9, 3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_point (access_point_id access_point.access_point_id%type, access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type)
    returns table (
        access_point_id access_point.access_point_id%type,
        name access_point.name%type,
        description access_point.description%type,
        "position" access_point.position%type
    )
    as $$
    select ap.access_point_id,
        ap.name,
        ap.description,
        ap.position
    from access_point ap
        join access_hub ah using (access_hub_id)
    where access_point_id = $1
        and ah.access_hub_id = $2
        and ah.customer_id = $3;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_point_with_hub_and_users(9, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_point_with_hub_and_users (access_point_id access_point.access_point_id%type, customer_id auth.users.id%type)
    returns table (
        access_point_id access_point.access_point_id%type,
        name access_point.name%type,
        description access_point.description%type,
        "position" access_point.position%type,
        access_hub_name access_hub.name%type,
        access_user_id access_user.access_user_id%type,
        access_user_name access_user.name%type,
        access_user_description access_user.description%type,
        access_user_code access_user.code%type
    )
    as $$
    select ap.access_point_id,
        ap.name,
        ap.description,
        ap.position,
        ah.name as access_hub_name,
        au.access_user_id,
        au.name as access_user_name,
        au.description as access_user_description,
        au.code as access_user_code
    from access_point ap
        join access_hub ah using (access_hub_id)
        left join access_point_to_access_user a2u using (access_point_id)
        left join access_user au using (access_user_id)
    where ap.access_point_id = $1
        and ah.customer_id = $2
    order by au.name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from create_access_user ('slim', 'caretaker', '555', '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function create_access_user (name access_user.name%type, description access_user.description%type, code access_user.code%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type
    )
    as $$
    insert into access_user (name, description, code, customer_id)
        values ($1, $2, $3, $4)
    returning access_user_id;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from update_access_user (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'master', 'master blaster', '9999', null, null);
create or replace function update_access_user (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type, name access_user.name%type, description access_user.description%type, code access_user.code%type, activate_code_at access_user.activate_code_at%type, expire_code_at access_user.expire_code_at%type)
    returns table (
        access_user_id access_user.access_user_id%type
    )
    as $$
    update
        access_user
    set (name,
            description,
            code,
            activate_code_at,
            expire_code_at) = ($3,
            $4,
            $5,
            $6,
            $7)
    where access_user_id = $1
        and customer_id = $2
    returning access_user_id;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from soft_delete_access_user (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function soft_delete_access_user (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        deleted_at access_user.deleted_at%type
    )
    as $$
    update
        access_user
    set deleted_at = now()
    where access_user_id = $1
        and customer_id = $2
    returning access_user_id,
        deleted_at;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_user (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_user (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        name access_user.name%type,
        description access_user.description%type,
        code access_user.code%type,
        activate_code_at access_user.activate_code_at%type,
        expire_code_at access_user.expire_code_at%type
    )
    as $$
    select access_user_id,
        name,
        description,
        code,
        activate_code_at,
        expire_code_at
    from access_user
    where access_user_id = $1
        and customer_id = $2
        and deleted_at is null;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_user_with_points (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_user_with_points (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        name access_user.name%type,
        description access_user.description%type,
        code access_user.code%type,
        activate_code_at access_user.activate_code_at%type,
        expire_code_at access_user.expire_code_at%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type,
        access_point_description access_point.description%type,
        access_hub_name access_hub.name%type
    )
    as $$
    select access_user_id,
        au.name,
        au.description,
        au.code,
        au.activate_code_at,
        au.expire_code_at,
        ap.access_point_id,
        ap.name,
        ap.description,
        ah.name
    from access_user au
    left join access_point_to_access_user a2u using (access_user_id)
    left join access_point ap using (access_point_id)
    left join access_hub ah using (access_hub_id)
where access_user_id = $1
    and au.customer_id = $2
    and deleted_at is null
order by ap.name,
    ah.name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_users ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_users (customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        name access_user.name%type,
        description access_user.description%type,
        code access_user.code%type,
        activate_code_at access_user.activate_code_at%type,
        expire_code_at access_user.expire_code_at%type
    )
    as $$
    select access_user_id,
        name,
        description,
        code,
        activate_code_at,
        expire_code_at
    from access_user
    where customer_id = $1
        and deleted_at is null
    order by name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_access_users_not_connected_to_point (9, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_users_not_connected_to_point (access_point_id access_point.access_point_id%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        name access_user.name%type
    )
    as $$
    with access_user_ids as (
        select au.access_user_id
        from access_user au
            join access_point_to_access_user p2u using (access_user_id)
        where p2u.access_point_id = $1
            and au.customer_id = $2
)
    select access_user_id,
        name
    from access_user
    where customer_id = $2
        and deleted_at is null
        and access_user_id not in (
            select *
            from access_user_ids)
    order by name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from connect_access_points_and_users (array[9], array[1, 3, 4, 5, 6, 7], '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function connect_access_points_and_users (access_point_ids integer[], access_user_ids integer[], customer_id auth.users.id%type)
    returns table (
        access_point_id access_point.access_point_id%type,
        access_user_id access_user.access_user_id%type
    )
    as $$
    with points as (
        select ap.access_point_id
        from access_point ap
            join access_hub ah using (access_hub_id)
        where ah.customer_id = $3
            and ap.access_point_id = any ($1)
),
users as (
    select au.access_user_id
    from access_user au
    where au.deleted_at is null
        and au.customer_id = $3
        and au.access_user_id = any ($2))
insert into access_point_to_access_user (access_point_id, access_user_id)
select p.access_point_id,
    u.access_user_id
from points p
    cross join users u
where not exists (
        select 1
        from access_point_to_access_user p2u
        where p2u.access_point_id = p.access_point_id
            and p2u.access_user_id = u.access_user_id)
returning access_point_id,
    access_user_id;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from disconnect_access_points_and_users (array[9], array[1, 3, 4, 5, 6, 7], '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function disconnect_access_points_and_users (access_point_ids integer[], access_user_ids integer[], customer_id auth.users.id%type)
    returns table (
        access_point_id access_point.access_point_id%type,
        access_user_id access_user.access_user_id%type
    )
    as $$
    with points as (
        select ap.access_point_id
        from access_point ap
            join access_hub ah using (access_hub_id)
        where ah.customer_id = $3
            and ap.access_point_id = any ($1)
),
users as (
    select au.access_user_id
    from access_user au
    where au.deleted_at is null
        and au.customer_id = $3
        and au.access_user_id = any ($2))
delete from access_point_to_access_user p2u using (
    select p.access_point_id,
        u.access_user_id
    from points p
    cross join users u) t
where p2u.access_point_id = t.access_point_id
    and p2u.access_user_id = t.access_user_id
returning p2u.access_point_id,
    p2u.access_user_id;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from get_grant_deny_stats ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
-- order by is important for gui rendering
create or replace function get_grant_deny_stats (customer_id auth.users.id%type)
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

