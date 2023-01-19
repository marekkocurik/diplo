CREATE USER db_user_admin with password '' VALID UNTIL 'infinity'; -- admin user s full permissions
CREATE USER db_user_update with password '' VALID UNTIL 'infinity'; -- user pre update zaznamov v tabulke users (meno, priezvisko, heslo, email...)
CREATE USER db_user_create with password '' VALID UNTIL 'infinity'; -- user pre create novych zaznamov v tabulke users (registracia)
CREATE USER db_user_exercise with password '' VALID UNTIL 'infinity'; -- user s pristupom do schemy exercises na SELECT z tabuliek

-- ALTER USER db_user_update SET statement_timeout = 750; -- aby user nemohol spustat hluposti

-- tips: https://tableplus.com/blog/2018/04/postgresql-how-to-grant-access-to-users.html

GRANT ALL PRIVILEGES ON DATABASE test TO db_user_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA exercises TO db_user_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users TO db_user_admin;

GRANT USAGE ON SCHEMA exercises TO db_user_admin;
GRANT USAGE ON SCHEMA users TO db_user_admin;
GRANT USAGE ON SCHEMA users TO db_user_create;
GRANT USAGE ON SCHEMA users TO db_user_update;
GRANT USAGE ON SCHEMA exercises TO db_user_exercise;

GRANT CREATE ON SCHEMA users TO db_user_create;
GRANT CREATE ON SCHEMA users TO db_user_update;

GRANT CONNECT ON DATABASE test TO db_user_create;
GRANT CONNECT ON DATABASE test TO db_user_update;
GRANT CONNECT ON DATABASE test TO db_user_exercise;

GRANT SELECT ON ALL TABLES IN SCHEMA exercises TO db_user_exercise;
GRANT INSERT ON users.users TO db_user_create;
GRANT UPDATE ON users.users TO db_user_update;

ALTER DATABASE test SET default_transaction_read_only = ON;