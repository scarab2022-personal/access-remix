begin;

create or replace function get_access_hub (access_hub_id integer, customer_id uuid)
    returns table (
        access_hub_id integer,
        name text,
        description text,
        customer_id uuid)
begin
    atomic
    select ah.access_hub_id,
        ah.name,
        ah.description,
        ah.customer_id
    from access_hub ah
        join auth.users on id = ah.customer_id
    where ah.access_hub_id = $1
        and ah.customer_id = $2;

    end;

select *
from get_access_hub (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

create or replace function get_access_hubs (customer_id uuid)
    returns setof access_hub
begin
    atomic
    select access_hub.*
    from access_hub
        join auth.users on id = customer_id
    where customer_id = get_access_hubs.customer_id
    order by name;

    end;

select *
from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

