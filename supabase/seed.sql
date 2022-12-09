-- auth.users copied from auth_data.pgsql.
-- access inserts copied from schema_seed.pgsql.
-- settings from pg_dump
set statement_timeout = 0;

set lock_timeout = 0;

set idle_in_transaction_session_timeout = 0;

set client_encoding = 'UTF8';

set standard_conforming_strings = on;

-- SELECT pg_catalog.set_config('search_path', '', false);
select pg_catalog.set_config('search_path', 'public', false);

set check_function_bodies = false;

set xmloption = content;

set client_min_messages = warning;

set row_security = off;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
    values ('00000000-0000-0000-0000-000000000000', 'f47bfe76-134c-4b27-859f-8007451a2522', 'authenticated', 'authenticated', 'appuser1@access.com', '$2a$10$gpKhyWF9dqgdGHWH/1opjepSRz9A8QtFm1.Oko227YleD0L9.X9Y2', '2022-10-24 18:43:08.061827+00', '2022-10-24 18:42:40.271826+00', '', '2022-10-24 18:42:40.271826+00', '', null, '', '', null, '2022-10-24 18:43:08.063267+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "customer"}', null, '2022-10-24 18:42:40.263963+00', '2022-10-24 19:35:24.86125+00', null, null, '', '', null, '', 0, NULL, '', null);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
    values ('00000000-0000-0000-0000-000000000000', '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'authenticated', 'authenticated', 'appuser2@access.com', '$2a$10$AZYjA8btkrIOWMgiqDiRz.BKQZyuPhMmITy8IqhU7piSVLSPbdija', '2022-10-24 18:44:49.803753+00', '2022-10-24 18:44:27.910894+00', '', '2022-10-24 18:44:27.910894+00', '', null, '', '', null, '2022-10-24 18:44:49.804272+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "customer"}', null, '2022-10-24 18:44:27.908407+00', '2022-10-24 19:35:24.886198+00', null, null, '', '', null, '', 0, NULL, '', null);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
    values ('00000000-0000-0000-0000-000000000000', 'b6d21aab-58ec-4122-be89-ca6355dc52f5', 'authenticated', 'authenticated', 'admin@access.com', '$2a$10$2GNivJp/KeQAPMYdkKNzNeZcquz2OPqYAPO31WlZ.23c3kSNNwh1q', '2022-10-24 18:45:28.991862+00', '2022-10-24 18:45:07.465984+00', '', '2022-10-24 18:45:07.465984+00', '', null, '', '', null, '2022-10-24 18:45:28.992415+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "admin"}', null, '2022-10-24 18:45:07.462593+00', '2022-10-24 19:35:24.908825+00', null, null, '', '', null, '', 0, NULL, '', null);


/*
insert into access_hub (name, description, customer_id)
select 'Hub ' || hub_index,
 'This is hub ' || hub_index,
 id
from auth.users,
 generate_series(1, 2) as t (hub_index)
where raw_user_meta_data @> '{"appRole": "customer"}'::jsonb
order by email;

insert into access_point (name, position, access_hub_id)
select 'Point ' || position,
 position,
 access_hub_id
from access_hub,
 generate_series(1, 4) as t (position)
order by access_hub_id;

insert into access_user (name, code, customer_id)
select name,
 code,
 id
from auth.users,
 (
 values ('master', '999'),
 ('guest1', '111'),
 ('guest2', '222')) t (name, code)
where raw_user_meta_data @> '{"appRole": "customer"}'::jsonb
order by email;

insert into access_point_to_access_user (access_point_id, access_user_id)
select access_point_id,
 access_user_id
from access_user
 join access_hub using (customer_id)
 join access_point using (access_hub_id)
where (access_user.name = 'master')
 or (access_user.name = 'guest1'
 and access_hub.name = 'Hub 1')
 or (access_user.name = 'guest2'
 and access_hub.name = 'Hub 2');

with times as (
 select i,
 current_timestamp - i * interval '15 min' as at,
 (i - 1) % (
 select count(*)
 from access_user) + 1 as access_user_id
 from generate_series(1, 75) as t (i)),
 series as (
 select at,
 i,
 access_user_id,
 array_agg(access_point_id) as access_point_ids
 from times
 join access_user using (access_user_id)
 join access_point_to_access_user using (access_user_id)
 join access_point using (access_point_id)
 group by at, i, access_user_id
 order by i)
 insert into access_event (at, access, code, access_user_id, access_point_id)
 select at,
 'grant' as access,
 code,
 access_user_id,
 access_point_ids[ceil(random() * array_length(access_point_ids, 1))] as access_point_id
from series
 join access_user using (access_user_id)
order by at;

insert into access_event (at, access, code, access_point_id)
select current_timestamp - i * interval '41 min' as at,
 'deny',
 '666',
 (i - 1) % (
 select count(*)
 from access_point) + 1 as access_point_id
from generate_series(1, 25) as t (i);
 */
