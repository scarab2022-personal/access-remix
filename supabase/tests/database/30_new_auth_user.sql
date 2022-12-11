begin;

select plan (3);

\set customer_id '1009e39a-fa61-4aab-a762-e7b1f3b014f3'
\set customer_email 'customer@test.com'
select is_empty ($$
        select * from auth.users
            where id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3' $$, 'customer_id does not exist');

insert into auth.users (id, email)
    values (:'customer_id', :'customer_email');

select isnt_empty ($$
        select * from auth.users
            where id = '1009e39a-fa61-4aab-a762-e7b1f3b014f3' $$, 'customer_id exists');

select is ((
            select count(*)
            from access_hub
            where customer_id = :'customer_id'), 2::bigint, 'customer has 2 hubs');

\set admin_id '5d94cce7-054f-4d01-a9ec-51e7b7ba8d59'
select *
from finish ();

rollback;

