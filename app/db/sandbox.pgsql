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


select *
from update_access_point (9, 3, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'Point 1a', 'This is the first point');

-- select *
-- from access_point
-- where access_point_id = 9;

rollback;

