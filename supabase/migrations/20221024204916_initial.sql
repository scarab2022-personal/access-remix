create table access_user (
    access_user_id serial primary key,
    name text not null check (name <> ''),
    description text default ''::text not null,
    code text not null check (code <> ''),
    activate_code_at timestamptz,
    expire_code_at timestamptz,
    customer_id uuid not null references auth.users on delete cascade,
    deleted_at timestamptz
);

create index on access_user (customer_id);

create unique index on access_user (customer_id, name)
where deleted_at is null;

create unique index on access_user (customer_id, code)
where deleted_at is null;

create table access_hub (
    access_hub_id serial primary key,
    name text default 'Hub' ::text not null check (name <> ''),
    description text default ''::text not null,
    heartbeat_at timestamptz,
    api_token text default ''::text not null,
    customer_id uuid not null references auth.users on delete cascade
);

create index on access_hub (customer_id);

create table access_point (
    access_point_id serial primary key,
    name text not null check (name <> ''),
    description text default ''::text not null,
    position integer not null check (position > 0),
    access_hub_id integer not null references access_hub on delete cascade,
    unique (access_hub_id, position)
);

create index on access_point (access_hub_id);

create table access_point_to_access_user (
    access_point_id integer not null references access_point on delete cascade,
    access_user_id integer not null references access_user on delete cascade,
    primary key (access_point_id, access_user_id)
);

create index on access_point_to_access_user (access_point_id);

create index on access_point_to_access_user (access_user_id);

create table access_event (
    access_event_id serial primary key,
    at timestamptz not null,
    access text not null check (access = 'grant' or access = 'deny'),
    code text not null,
    access_user_id integer references access_user (access_user_id) on delete cascade,
    access_point_id integer not null references access_point (access_point_id) on delete cascade
);

create index on access_event (access_user_id);

create index on access_event (access_point_id);

