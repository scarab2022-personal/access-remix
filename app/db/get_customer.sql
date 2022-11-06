/* @name GetCustomer */
-- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
select email,
    id,
    last_sign_in_at
from auth.users
where id = :customerId;

