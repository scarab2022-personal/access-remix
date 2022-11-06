/* @name GetAccessPoint */
-- \set accessPointId 14
-- \set accessHubId 4
-- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
-- select access_point.*
select access_point.access_point_id,
    access_point.name,
    access_point.position,
    access_point.access_hub_id
from access_point
    join access_hub using (access_hub_id)
    join auth.users u on u.id = customer_id
where access_point_id = :accessPointId
    and access_hub_id = :accessHubId
    and customer_id = :customerId;

