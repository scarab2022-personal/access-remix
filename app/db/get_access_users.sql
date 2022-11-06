/* @name GetAccessUsers */
-- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
select *
from access_user
where customer_id = :customerId
order by name;

