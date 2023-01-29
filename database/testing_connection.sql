SELECT current_user;

SET ROLE admin;

ALTER USER postgres WITH NOLOGIN;

ALTER USER postgres WITH LOGIN;

ALTER USER admin WITH LOGIN;

SET ROLE postgres;

ALTER USER admin WITH PASSWORD 'a';

REVOKE ALL ON ROLE postgres FROM admin;

GRANT CONNECT ON DATABASE test TO postgres;

REVOKE CONNECT ON DATABASE test FROM postgres;

GRANT ALL ON DATABASE test TO admin;

CREATE ROLE def_connect LOGIN PASSWORD 'def';

GRANT ALL PRIVILEGES ON DATABASE test TO def_connect;
GRANT USAGE ON SCHEMA public TO def_connect;

REVOKE ALL ON DATABASE test FROM def_connect;
DROP ROLE def_connect;

CREATE USER def_connect WITH PASSWORD 'ahoj';