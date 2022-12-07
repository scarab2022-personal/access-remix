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
/*
select *
from access_point_to_access_user
where access_point_id in (9)
order by access_point_id,
 access_user_id;
 */
-- select * from get_access_users ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_users (customer_id uuid)
    returns table (
        access_user_id access_user.access_user_id%type,
        name access_user.name%type,
        description access_user.description%type,
        code access_user.code%type,
        activate_code_at access_user.activate_code_at%type,
        expire_code_at access_user.expire_code_at%type
    )
    as $$
    select access_user_id,
        name,
        description,
        code,
        activate_code_at,
        expire_code_at
    from access_user
    where customer_id = $1
        and deleted_at is null
    order by name;

$$
language sql
security definer set search_path = public, pg_temp;

select *
from get_access_users ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

-- select * from create_access_user ('slim', 'caretaker', '555', '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function create_access_user (name access_user.name%type, description access_user.description%type, code access_user.code%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type
    )
    as $$
    insert into access_user (name, description, code, customer_id)
        values ($1, $2, $3, $4)
    returning access_user_id;

$$
language sql
security definer set search_path = public, pg_temp;

create or replace function update_access_user (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type, name access_user.name%type, description access_user.description%type, code access_user.code%type, activate_code_at access_user.activate_code_at%type, expire_code_at access_user.expire_code_at%type)
    returns table (
        access_user_id access_user.access_user_id%type
    )
    as $$
    update
        access_user
    set (name,
            description,
            code,
            activate_code_at,
            expire_code_at) = ($3,
            $4,
            $5,
            $6,
            $7)
    where access_user_id = $1
        and customer_id = $2
    returning access_user_id;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from from get_access_user_with_points (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function get_access_user_with_points (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        name access_user.name%type,
        description access_user.description%type,
        code access_user.code%type,
        activate_code_at access_user.activate_code_at%type,
        expire_code_at access_user.expire_code_at%type,
        access_point_id access_point.access_point_id%type,
        access_point_name access_point.name%type
    )
    as $$
    select access_user_id,
        au.name,
        au.description,
        au.code,
        au.activate_code_at,
        au.expire_code_at,
        ap.access_point_id,
        ap.name
    from access_user au
    left join access_point_to_access_user a2u using (access_user_id)
    left join access_point ap using (access_point_id)
where access_user_id = $1
    and customer_id = $2
    and deleted_at is null
order by ap.name;

$$
language sql
security definer set search_path = public, pg_temp;

-- select * from soft_delete_access_user (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
create or replace function soft_delete_access_user (access_user_id access_user.access_user_id%type, customer_id auth.users.id%type)
    returns table (
        access_user_id access_user.access_user_id%type,
        deleted_at access_user.deleted_at%type
    )
    as $$
    update
        access_user
    set deleted_at = now()
    where access_user_id = $1
        and customer_id = $2
    returning access_user_id,
        deleted_at;

$$
language sql
security definer set search_path = public, pg_temp;

-- select *
-- from create_access_user ('slim', 'caretaker', '555', '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
-- select *
-- from update_access_user (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e', 'master', 'master blaster', '9999', null, null);
-- select *
-- from access_user
-- where name = 'master';
-- select *
-- from get_access_user_with_points (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
select *
from soft_delete_access_user (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

