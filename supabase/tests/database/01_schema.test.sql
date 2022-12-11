begin;

select plan (8);

-- tables
select has_table ('access_hub', 'access_hub should exist');

select has_table ('access_point', 'access_point should exist');

select has_table ('access_user', 'access_user should exist');

select has_table ('access_point_to_access_user', 'access_point_to_access_user should exist');

-- triggers
select trigger_is ('auth', 'users', 'on_new_auth_user_before', 'public', 'on_new_auth_user_before', 'trigger on_new_auth_user_before should exist');

select trigger_is ('auth', 'users', 'on_new_auth_user_after', 'public', 'on_new_auth_user_after', 'trigger on_new_auth_user_after should exist');

-- functions
select has_function ('connect_access_points_and_users', '{integer[], integer[], uuid}'::name[], 'connect_access_points_and_users should exist');

select has_function ('disconnect_access_points_and_users', '{integer[], integer[], uuid}'::name[], 'connect_access_points_and_users should exist');

select *
from finish ();

rollback;

