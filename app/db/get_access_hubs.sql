/* @name GetAccessHubs */
-- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
select access_hub.*
from access_hub
    join auth.users on id = customer_id
where customer_id = :customerId
order by name;

