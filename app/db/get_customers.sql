/* @name GetCustomers */
select email, id, last_sign_in_at
from auth.users
where raw_user_meta_data @> '{"appRole": "customer"}'::jsonb
order by email;
