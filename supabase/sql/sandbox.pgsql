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
select (
        select count(*)
        from auth.users
        where raw_user_meta_data @> '{"appRole": "customer"}'::jsonb) as customer,
    (
        select count(*)
        from access_hub) as access_hub,
    (
        select count(*)
        from access_event
        where access = 'grant') as grant, (select count(*)
    from access_event
    where access = 'deny') as deny;

rollback;

