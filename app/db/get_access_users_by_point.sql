/* @name GetAccessUsersByPoint */
-- \set accessPointId 14
select access_user.*
from access_user
    join access_point_to_access_user using (access_user_id)
where access_point_id = :accessPointId
order by name;

