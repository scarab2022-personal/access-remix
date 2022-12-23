-- \set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
-- \set access_hub_name 'My fancy hub'
-- select * from create_access_hub_with_points (:'access_hub_name', 'This is my hub', 2, :'customer_id');
create or replace function create_access_hub_with_points (name access_hub.name%type, description access_hub.description%type, num_points integer, customer_id auth.users.id%type)
    returns table (
        access_hub_id access_hub.access_hub_id%type,
        name access_hub.name%type,
        customer_id access_hub.customer_id%type
    )
    as $$
    with hub as (
insert into access_hub (name, description, customer_id)
        select $1,
            $2,
            id
        from auth.users
        where id = $4
            and raw_user_meta_data ->> 'appRole' = 'customer'
        returning *
),
points as (
insert into access_point (name, position, access_hub_id)
    select 'Point ' || position,
        position,
        access_hub_id
    from hub,
        generate_series(1, $3) as t (position)
    order by position
    returning *
)
select access_hub_id,
    name,
    customer_id
from hub;

$$
language sql
security definer set search_path = public, pg_temp;

-- select delete_access_hub (access_hub_id, :'customer_id') from access_hub where name = :'access_hub_name';
create or replace function delete_access_hub (access_hub_id access_hub.access_hub_id%type, customer_id auth.users.id%type)
    returns table (
        access_hub_id access_hub.access_hub_id%type
    )
    as $$
    delete from access_hub
    where access_hub_id = $1
        and customer_id = $2
    returning access_hub_id;

$$
language sql
security definer set search_path = public, pg_temp;

