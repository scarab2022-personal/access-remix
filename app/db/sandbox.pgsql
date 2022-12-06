begin;

-- \set access_point_id 9
-- \set access_hub_id 3
-- \set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
-- select ap.access_point_id,
--     ap.name,
--     ap.description,
--     ap.position
-- from access_point ap
--     join access_hub ah using (access_hub_id)
-- where access_point_id = :access_point_id
--     and ah.access_hub_id = :access_hub_id
--     and ah.customer_id = :'customer_id';

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

select * from get_access_point(9, 3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

