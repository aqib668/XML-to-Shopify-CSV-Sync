create or replace function create_user_table() returns void language plpgsql as $$
begin
  if not exists (select from information_schema.tables where table_name = 'users') then
    create table users (
      id serial primary key,
      username varchar(255) not null,
      email varchar(255) not null unique,
      password varchar(255) not null,
      created_at timestamp default current_timestamp
    );
  end if;
end;
$$;
