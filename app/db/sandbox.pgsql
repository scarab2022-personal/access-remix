begin;

-- select * from update_access_point (9, 3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'Point 1a', 'This is the first point');
create or replace function update_access_point (access_point_id access_point.access_point_id%type, access_hub_id access_hub.access_hub_id%type, customer_id access_hub.customer_id%type, name access_point.name%type, description access_point.description%type)
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

-- \set access_point_id 9
-- \set access_hub_id 3
-- \set customer_id
select au.access_user_id
from access_user au
    join access_point_to_access_user p2u using (access_user_id)
where au.customer_id = :'customer_id'
    and p2u.access_point_id = :access_point_id;

with access_user_ids as (
    select au.access_user_id
    from access_user au
        join access_point_to_access_user p2u using (access_user_id)
    where au.customer_id = :'customer_id'
        and p2u.access_point_id = :access_point_id
)
select *
from access_user
where customer_id = :'customer_id'
    and deleted_at is null
    and access_user_id not in (
        select *
        from access_user_ids)
order by name;

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

-- delete from access_point_to_access_user where access_point_id = 9;
select *
from get_access_users_not_connected_to_point (9, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

