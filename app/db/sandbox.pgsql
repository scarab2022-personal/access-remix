begin;

-- delete from access_user
-- where access_user_id in (4, 5);
-- \set access_point_id 9
-- \set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
-- select ap.access_point_id,
--     ap.name,
--     ap.description,
--     ap.position,
--     ah.name as access_hub_name,
--     au.access_user_id,
--     au.name as access_user_name,
--     au.description as access_user_description,
--     au.code as access_user_code
-- from access_point ap
--     join access_hub ah using (access_hub_id)
--     left join access_point_to_access_user a2u using (access_point_id)
--     left join access_user au using (access_user_id)
-- where ap.access_point_id = :access_point_id
--     and ah.customer_id = :'customer_id';
-- select * from get_access_point_with_hub_and_users(9, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_point_with_hub_and_users (access_point_id access_point.access_point_id%type, customer_id access_hub.customer_id%type)
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

-- delete from access_user
-- where access_user_id in (4, 5);
select *
from get_access_point_with_hub_and_users (9, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

