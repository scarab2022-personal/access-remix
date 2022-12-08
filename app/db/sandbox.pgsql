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
-- delete from access_point_to_access_user
-- where access_user_id = 4;
-- select *
-- from get_access_user_with_points (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');
update
    access_user
set activate_code_at = now()
where access_user_id = 4
returning *;

update
    access_user
set activate_code_at = '2022-12-08T01:26:14.750Z'
where access_user_id = 4
returning *;

update
    access_user
set activate_code_at = '2022-12-09T01:28:00.000Z'
where access_user_id = 4
returning *;

rollback;

