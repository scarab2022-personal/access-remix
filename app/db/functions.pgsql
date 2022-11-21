begin;

\ir ../../supabase/migrations/20221121144431_functions.sql


select *
from get_access_hub (4, '733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

select *
from get_access_hubs ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

