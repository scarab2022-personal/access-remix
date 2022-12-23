begin;


/*
\set access_point_id 9
\set access_hub_id 3
-- appuser2@access.com
\set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
\set access_user_id 6
\set access_point_ids array[8, 9, 10, 11, 12, 13]
\set access_user_ids array[3, 4, 5, 6, 7]
\set access_user_ids array[]::integer[]
 */
/*
\set customer_id 'f47bfe76-134c-4b27-859f-8007451a2523'
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
 values ('00000000-0000-0000-0000-000000000000', :'customer_id', 'authenticated', 'authenticated', 'appuser3@access.com', '$2a$10$gpKhyWF9dqgdGHWH/1opjepSRz9A8QtFm1.Oko227YleD0L9.X9Y2', '2022-10-24 18:43:08.061827+00', '2022-10-24 18:42:40.271826+00', '', '2022-10-24 18:42:40.271826+00', '', null, '', '', null, '2022-10-24 18:43:08.063267+00', '{"provider": "email", "providers": ["email"]}', '{}', null, '2022-10-24 18:42:40.263963+00', '2022-10-24 19:35:24.86125+00', null, null, '', '', null, '', 0, NULL, '', null);
 */
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

\set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
-- \set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76f'
\set access_hub_name 'My fancy hub'
select *
from create_access_hub_with_points (:'access_hub_name', 'This is my hub', 2, :'customer_id');

select access_hub_id,
    h.name,
    h.description,
    p.name,
    p.position
from access_hub h
    join access_point p using (access_hub_id)
where customer_id = :'customer_id';

select delete_access_hub (access_hub_id, :'customer_id')
from access_hub
where name = :'access_hub_name';

select *
from access_hub
where name = :'access_hub_name';

rollback;

