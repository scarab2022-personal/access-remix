-- get_access_hub (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e')
create or replace function get_access_hub (access_hub_id integer, customer_id uuid)
    returns access_hub
    security definer
    set search_path = public
    as $$
    select access_hub.*
    from access_hub
        join auth.users on id = customer_id
    where access_hub_id = get_access_hub.access_hub_id
        and customer_id = get_access_hub.customer_id;

$$
language sql;

-- get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e')
create or replace function get_access_hubs (customer_id uuid)
    returns setof access_hub
    security definer
    set search_path = public
    as $$
    select access_hub.*
    from access_hub
        join auth.users on id = customer_id
    where customer_id = get_access_hubs.customer_id
    order by name;

$$
language sql;

