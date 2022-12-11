begin;

select plan (9);

\set customer_id '1009e39a-fa61-4aab-a762-e7b1f3b014f3'
\set customer_email 'customer@test.com'
select is ((
            select count(*)
            from auth.users
            where id = :'customer_id'), 0::bigint, 'customer does not exist');

insert into auth.users (id, email)
    values (:'customer_id', :'customer_email');

select is ((
            select count(*)
            from auth.users
            where id = :'customer_id'), 1::bigint, 'customer exists');

select is ((
            select count(*)
            from access_hub
            where customer_id = :'customer_id'), 2::bigint, 'customer has 2 hubs');

select is ((
            select count(*)
            from access_point
                join access_hub using (access_hub_id)
            where customer_id = :'customer_id'), 8::bigint, 'customer has 8 points');

select is ((
            select count(*)
            from access_user
            where customer_id = :'customer_id'), 3::bigint, 'customer has 3 users');

\set admin_id '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59'
\set admin_email 'admin@test.com'
select is ((
            select count(*)
            from auth.users
            where id = :'admin_id'), 0::bigint, 'admin does not exist');

insert into auth.users (id, email, raw_user_meta_data)
    values (:'admin_id', :'admin_email', jsonb_build_object('appRole', 'admin'));

select is ((
            select count(*)
            from auth.users
            where id = :'admin_id'), 1::bigint, 'admin exists');

select is ((
            select count(*)
            from access_hub
            where customer_id = :'admin_id'), 0::bigint, 'admin has 0 hubs');

select is ((
            select count(*)
            from access_user
            where customer_id = :'admin_id'), 0::bigint, 'admin has 0 users');

select *
from finish ();

rollback;

