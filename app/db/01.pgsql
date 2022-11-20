begin;

select ah.*,
    ap.*
from access_hub ah
    join access_point ap using (access_hub_id)
order by ah.access_hub_id,
    position \gdesc

create or replace function ah_get (access_hub_id integer, customer_id uuid)
    returns table (
        access_hub_id integer,
        name text,
        description text,
        customer_id uuid
    )
    as $$
    select ah.access_hub_id,
        ah.name,
        ah.description,
        ah.customer_id
    from access_hub ah
        join auth.users on id = ah.customer_id
    where ah.access_hub_id = $1
        and ah.customer_id = $2;

$$
language sql;

select *
from ah_get (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

