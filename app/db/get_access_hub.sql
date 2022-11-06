/* @name GetAccessHub */
-- \set accessHubId 4
-- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
select access_hub.*
from access_hub
    join auth.users on id = customer_id
where access_hub_id = :accessHubId
    and customer_id = :customerId;

