begin;

\ir ../migrations/20221121144431_functions.sql
select *
from get_customers ();

select *
from get_customer ('733e54ae-c9dc-4b9a-94d0-764fbd1bd76e');

rollback;

