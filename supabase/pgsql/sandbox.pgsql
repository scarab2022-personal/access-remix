begin;


/*
\set access_point_id 9
\set access_hub_id 3
\set customer_id '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e'
\set access_user_id 6
\set access_point_ids array[8, 9, 10, 11, 12, 13]
\set access_user_ids array[3, 4, 5, 6, 7]
\set access_user_ids array[]::integer[]
 */
-- INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at) VALUES ('00000000-0000-0000-0000-000000000000', 'f47bfe76-134c-4b27-859f-8007451a2522', 'authenticated', 'authenticated', 'appuser1@access.com', '$2a$10$gpKhyWF9dqgdGHWH/1opjepSRz9A8QtFm1.Oko227YleD0L9.X9Y2', '2022-10-24 18:43:08.061827+00', '2022-10-24 18:42:40.271826+00', '', '2022-10-24 18:42:40.271826+00', '', NULL, '', '', NULL, '2022-10-24 18:43:08.063267+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "customer"}', NULL, '2022-10-24 18:42:40.263963+00', '2022-10-24 19:35:24.86125+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL);
-- INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at) VALUES ('00000000-0000-0000-0000-000000000000', '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'authenticated', 'authenticated', 'appuser2@access.com', '$2a$10$AZYjA8btkrIOWMgiqDiRz.BKQZyuPhMmITy8IqhU7piSVLSPbdija', '2022-10-24 18:44:49.803753+00', '2022-10-24 18:44:27.910894+00', '', '2022-10-24 18:44:27.910894+00', '', NULL, '', '', NULL, '2022-10-24 18:44:49.804272+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "customer"}', NULL, '2022-10-24 18:44:27.908407+00', '2022-10-24 19:35:24.886198+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL);
-- INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at) VALUES ('00000000-0000-0000-0000-000000000000', 'b6d21aab-58ec-4122-be89-ca6355dc52f5', 'authenticated', 'authenticated', 'admin@access.com', '$2a$10$2GNivJp/KeQAPMYdkKNzNeZcquz2OPqYAPO31WlZ.23c3kSNNwh1q', '2022-10-24 18:45:28.991862+00', '2022-10-24 18:45:07.465984+00', '', '2022-10-24 18:45:07.465984+00', '', NULL, '', '', NULL, '2022-10-24 18:45:28.992415+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "admin"}', NULL, '2022-10-24 18:45:07.462593+00', '2022-10-24 19:35:24.908825+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL);
create or replace function on_new_auth_user_before ()
    returns trigger
    language plpgsql
    security definer
    set search_path = public, pg_temp
    as $$
begin
    raise notice 'new auth user before: %, %, %', new.id, new.email, new.raw_user_meta_data;
    if (new.raw_user_meta_data ->> 'appRole' = 'admin') then
        return new;
    end if;
    -- hack
    new.raw_user_meta_data = '{"appRole": "customer"}'::jsonb;
    return new;
end;
$$;

create or replace trigger on_new_auth_user_before before insert on auth.users for each row execute procedure on_new_auth_user_before ();

create or replace function on_new_auth_user_after ()
    returns trigger
    language plpgsql
    security definer
    set search_path = public, pg_temp
    as $$
declare
    hub_ids int[];
begin
    raise notice 'new auth user_after: %, %, %', new.id, new.email, new.raw_user_meta_data;
    if (new.raw_user_meta_data ->> 'appRole' = 'admin') then
        return new;
    end if;
    -- create access hubs
    with hubs as (
insert into access_hub (name, description, customer_id)
        select 'Hub ' || hub_index,
            'This is hub ' || hub_index,
            new.id
        from generate_series(1, 2) as t (hub_index)
        returning access_hub_id
)
    select array_agg(access_hub_id)
    from hubs into hub_ids;
    -- create access points
    insert into access_point (name, position, access_hub_id)
    select 'Point ' || position,
        position,
        access_hub_id
    from (
        select unnest(hub_ids) as access_hub_id) as h,
    generate_series(1, 4) as t (position)
order by access_hub_id;
    -- create access users
    insert into access_user (name, code, customer_id)
        values ('master', '999', new.id), ('guest1', '111', new.id), ('guest2', '222', new.id);
    -- connect access users to points
    insert into access_point_to_access_user (access_point_id, access_user_id)
    select ap.access_point_id,
        au.access_user_id
    from access_user au
        join access_hub ah using (customer_id)
        join access_point ap using (access_hub_id)
    where au.customer_id = new.id
        and ((au.name = 'master')
            or (au.name = 'guest1'
                and ah.name = 'Hub 1')
            or (au.name = 'guest2'
                and ah.name = 'Hub 2'));
    -- create grant access events
    with access_user_ids as (
        select access_user_id,
            row_number() over (order by access_user_id)
        from access_user
    where customer_id = new.id
), times as (
    select i,
        current_timestamp - i * interval '15 min' as at,
        access_user_id
    from generate_series(1, 75) as t (i)
    join access_user_ids on ((i - 1) % (
            select count(*)
            from access_user_ids) + 1) = row_number
),
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
        -- create deny access events
        with access_point_ids as (
            select access_point_id,
                row_number() over (order by access_point_id)
            from access_point
            join access_hub using (access_hub_id)
        where customer_id = new.id)
insert into access_event (at, access, code, access_point_id)
select current_timestamp - i * interval '41 min',
    'deny',
    '666',
    access_point_id
from generate_series(1, 25) as t (i)
    join access_point_ids on ((i - 1) % (
            select count(*)
            from access_point_ids) + 1) = row_number;
        return new;
end;
$$;

create or replace trigger on_new_auth_user_after after insert on auth.users for each row execute procedure on_new_auth_user_after ();

\set customer_id 'f47bfe76-134c-4b27-859f-8007451a2523'
-- insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
--     values ('00000000-0000-0000-0000-000000000000', :'customer_id', 'authenticated', 'authenticated', 'appuser3@access.com', '$2a$10$gpKhyWF9dqgdGHWH/1opjepSRz9A8QtFm1.Oko227YleD0L9.X9Y2', '2022-10-24 18:43:08.061827+00', '2022-10-24 18:42:40.271826+00', '', '2022-10-24 18:42:40.271826+00', '', null, '', '', null, '2022-10-24 18:43:08.063267+00', '{"provider": "email", "providers": ["email"]}', '{"appRole": "customer"}', null, '2022-10-24 18:42:40.263963+00', '2022-10-24 19:35:24.86125+00', null, null, '', '', null, '', 0, NULL, '', null);
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
    values ('00000000-0000-0000-0000-000000000000', :'customer_id', 'authenticated', 'authenticated', 'appuser3@access.com', '$2a$10$gpKhyWF9dqgdGHWH/1opjepSRz9A8QtFm1.Oko227YleD0L9.X9Y2', '2022-10-24 18:43:08.061827+00', '2022-10-24 18:42:40.271826+00', '', '2022-10-24 18:42:40.271826+00', '', null, '', '', null, '2022-10-24 18:43:08.063267+00', '{"provider": "email", "providers": ["email"]}', '{}', null, '2022-10-24 18:42:40.263963+00', '2022-10-24 19:35:24.86125+00', null, null, '', '', null, '', 0, NULL, '', null);

-- select *
-- from access_hub
-- where customer_id = :'customer_id';
-- select ap.*
-- from access_point ap
--     join access_hub ah using (access_hub_id)
-- where ah.customer_id = :'customer_id';
-- select *
-- from access_user
-- where customer_id = :'customer_id';
-- select ae.*
-- from access_event ae
--     join access_point using (access_point_id)
--     join access_hub using (access_hub_id)
-- where customer_id = :'customer_id'
-- order by at desc;
select id,
    email,
    raw_user_meta_data
from auth.users
where id = :'customer_id';

rollback;

