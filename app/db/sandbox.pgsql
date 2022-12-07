begin;


/*
\set access_point_id 9
\set access_hub_id 3
\set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
\set access_user_id 6
\set access_point_ids array[8, 9, 10, 11, 12, 13]
\set access_user_ids array[3, 4, 5, 6, 7]
\set access_user_ids array[]::integer[]
 */
/*
select *
from access_point_to_access_user
where access_point_id in (9)
order by access_point_id,
 access_user_id;
 */
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

select *
from disconnect_access_points_and_users (array[9], array[1, 3, 4], '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

select *
from connect_access_points_and_users (array[9], array[6], '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

select *
from access_point_to_access_user
where access_point_id in (9)
order by access_point_id,
    access_user_id;

rollback;

