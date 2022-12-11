-- https://dba.stackexchange.com/questions/255412/how-to-select-functions-that-belong-in-a-given-extension-in-postgresql
select e.extname,
    ne.nspname as extschema,
    p.proname,
    np.nspname as proschema
from pg_catalog.pg_extension as e
    inner join pg_catalog.pg_depend as d on (d.refobjid = e.oid)
    inner join pg_catalog.pg_proc as p on (p.oid = d.objid)
    inner join pg_catalog.pg_namespace as ne on (ne.oid = e.extnamespace)
    inner join pg_catalog.pg_namespace as np on (np.oid = p.pronamespace)
where e.extname = 'pgtap'
    and d.deptype = 'e'
order by 1,
    3
