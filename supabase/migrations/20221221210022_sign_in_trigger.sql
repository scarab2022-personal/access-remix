/*
\set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
select access_hub_id,
 name,
 heartbeat_at
from access_hub
where customer_id = :'customer_id';

update
 auth.users
set last_sign_in_at = now()
where id = :'customer_id';

select access_hub_id,
 name,
 heartbeat_at
from access_hub
where customer_id = :'customer_id';
 */
create or replace function on_auth_user_sign_in ()
    returns trigger
    language plpgsql
    security definer
    set search_path = public, pg_temp
    as $$
begin
    if (new.raw_user_meta_data ->> 'appRole' = 'admin') then
        return new;
    end if;
    update
        access_hub
    set heartbeat_at = now()
    where customer_id = new.id;
    return new;
end;
$$;

create or replace trigger on_auth_user_sign_in after update of last_sign_in_at on auth.users for each row execute procedure on_auth_user_sign_in ();

