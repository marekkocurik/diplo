CREATE ROLE r_tokens_select WITH NOINHERIT;
CREATE ROLE r_tokens_insert WITH NOINHERIT;
CREATE ROLE r_tokens_update WITH NOINHERIT;

CREATE ROLE r_ratings_select WITH NOINHERIT;
CREATE ROLE r_ratings_insert WITH NOINHERIT;
CREATE ROLE r_ratings_update WITH NOINHERIT;

CREATE ROLE r_users_select WITH NOINHERIT;
CREATE ROLE r_users_insert WITH NOINHERIT;
CREATE ROLE r_users_update WITH NOINHERIT;

CREATE ROLE r_users_to_roles_select WITH NOINHERIT;
CREATE ROLE r_users_to_roles_insert WITH NOINHERIT;

CREATE ROLE r_roles_select WITH NOINHERIT;
CREATE ROLE r_roles_insert WITH NOINHERIT;

CREATE ROLE r_users_to_chapters_select WITH NOINHERIT;
CREATE ROLE r_users_to_chapters_insert WITH NOINHERIT;

CREATE ROLE r_chapters_select WITH NOINHERIT;

CREATE ROLE r_exercises_select WITH NOINHERIT;

CREATE ROLE r_answers_select WITH NOINHERIT;
CREATE ROLE r_answers_insert WITH NOINHERIT;

CREATE ROLE r_solutions_select WITH NOINHERIT;
CREATE ROLE r_solutions_insert WITH NOINHERIT;

CREATE ROLE r_members_select WITH NOINHERIT;
CREATE ROLE r_members_insert WITH NOINHERIT;
CREATE ROLE r_members_update WITH NOINHERIT;
CREATE ROLE r_members_delete WITH NOINHERIT;

CREATE ROLE r_bookings_select WITH NOINHERIT;
CREATE ROLE r_bookings_insert WITH NOINHERIT;
CREATE ROLE r_bookings_update WITH NOINHERIT;
CREATE ROLE r_bookings_delete WITH NOINHERIT;

CREATE ROLE r_facilities_select WITH NOINHERIT;
CREATE ROLE r_facilities_insert WITH NOINHERIT;
CREATE ROLE r_facilities_update WITH NOINHERIT;
CREATE ROLE r_facilities_delete WITH NOINHERIT;

GRANT USAGE ON SCHEMA users TO r_tokens_select;
GRANT USAGE ON SCHEMA users TO r_tokens_insert;
GRANT USAGE ON SCHEMA users TO r_tokens_update;

GRANT USAGE ON SCHEMA users TO r_ratings_select;
GRANT USAGE ON SCHEMA users TO r_ratings_insert;
GRANT USAGE ON SCHEMA users TO r_ratings_update;

GRANT USAGE ON SCHEMA users TO r_users_select;
GRANT USAGE ON SCHEMA users TO r_users_insert;
GRANT USAGE ON SCHEMA users TO r_users_update;

GRANT USAGE ON SCHEMA users TO r_users_to_roles_select;
GRANT USAGE ON SCHEMA users TO r_users_to_roles_insert;

GRANT USAGE ON SCHEMA users TO r_roles_select;
GRANT USAGE ON SCHEMA users TO r_roles_insert;

GRANT USAGE ON SCHEMA users TO r_users_to_chapters_select;
GRANT USAGE ON SCHEMA users TO r_users_to_chapters_insert;

GRANT USAGE ON SCHEMA users TO r_chapters_select;

GRANT USAGE ON SCHEMA users TO r_exercises_select;

GRANT USAGE ON SCHEMA users TO r_answers_select;
GRANT USAGE ON SCHEMA users TO r_answers_insert;

GRANT USAGE ON SCHEMA users TO r_solutions_select;
GRANT USAGE ON SCHEMA users TO r_solutions_insert;

GRANT USAGE ON SCHEMA cd TO r_members_select;
GRANT USAGE ON SCHEMA cd TO r_members_insert;
GRANT USAGE ON SCHEMA cd TO r_members_update;
GRANT USAGE ON SCHEMA cd TO r_members_delete;

GRANT USAGE ON SCHEMA cd TO r_bookings_select;
GRANT USAGE ON SCHEMA cd TO r_bookings_insert;
GRANT USAGE ON SCHEMA cd TO r_bookings_update;
GRANT USAGE ON SCHEMA cd TO r_bookings_delete;

GRANT USAGE ON SCHEMA cd TO r_facilities_select;
GRANT USAGE ON SCHEMA cd TO r_facilities_insert;
GRANT USAGE ON SCHEMA cd TO r_facilities_update;
GRANT USAGE ON SCHEMA cd TO r_facilities_delete;

GRANT SELECT ON users.tokens TO r_tokens_select;
GRANT INSERT ON users.tokens TO r_tokens_insert;
GRANT UPDATE ON users.tokens TO r_tokens_update;

GRANT SELECT ON users.ratings TO r_ratings_select;
GRANT INSERT ON users.ratings TO r_ratings_insert;
GRANT UPDATE ON users.ratings TO r_ratings_update;

GRANT SELECT ON users.users TO r_users_select;
GRANT INSERT ON users.users TO r_users_insert;
GRANT UPDATE ON users.users TO r_users_update;

GRANT SELECT ON users.users_to_roles TO r_users_to_roles_select;
GRANT INSERT ON users.users_to_roles TO r_users_to_roles_insert;

GRANT SELECT ON users.roles TO r_roles_select;
GRANT INSERT ON users.roles TO r_roles_insert;

GRANT SELECT ON users.users_to_chapters TO r_users_to_chapters_select;
GRANT INSERT ON users.users_to_chapters TO r_users_to_chapters_insert;

GRANT SELECT ON users.chapters TO r_chapters_select;

GRANT SELECT ON users.exercises TO r_exercises_select;

GRANT SELECT ON users.answers TO r_answers_select;
GRANT INSERT ON users.answers TO r_answers_insert;

GRANT SELECT ON users.solutions TO r_solutions_select;
GRANT INSERT ON users.solutions TO r_solutions_insert;

GRANT SELECT ON cd.members TO r_members_select;
GRANT INSERT ON cd.members TO r_members_insert;
GRANT UPDATE ON cd.members TO r_members_update;
GRANT DELETE ON cd.members TO r_members_delete;

GRANT SELECT ON cd.bookings TO r_bookings_select;
GRANT INSERT ON cd.bookings TO r_bookings_insert;
GRANT UPDATE ON cd.bookings TO r_bookings_update;
GRANT DELETE ON cd.bookings TO r_bookings_delete;

GRANT SELECT ON cd.facilities TO r_facilities_select;
GRANT INSERT ON cd.facilities TO r_facilities_insert;
GRANT UPDATE ON cd.facilities TO r_facilities_update;
GRANT DELETE ON cd.facilities TO r_facilities_delete;

CREATE USER u_executioner WITH NOLOGIN IN GROUP
r_tokens_select,
r_tokens_insert,
r_tokens_update,
r_ratings_select,
r_ratings_insert,
r_ratings_update,
r_users_select,
r_users_insert,
r_users_update,
r_users_to_roles_select,
r_users_to_roles_insert,
r_roles_select,
r_roles_insert,
r_users_to_chapters_select,
r_users_to_chapters_insert,
r_chapters_select,
r_exercises_select,
r_answers_select,
r_answers_insert,
r_solutions_select,
r_solutions_insert,
r_members_select,
r_members_insert,
r_members_update,
r_members_delete,
r_bookings_select,
r_bookings_insert,
r_bookings_update,
r_bookings_delete,
r_facilities_select,
r_facilities_insert,
r_facilities_update,
r_facilities_delete;

CREATE USER u_student WITH NOLOGIN IN GROUP 
r_members_select,
r_members_insert,
r_members_update,
r_members_delete,
r_bookings_select,
r_bookings_insert,
r_bookings_update,
r_bookings_delete,
r_facilities_select,
r_facilities_insert,
r_facilities_update,
r_facilities_delete;

CREATE USER u_teacher WITH NOLOGIN IN GROUP
r_members_select,
r_members_insert,
r_members_update,
r_members_delete,
r_bookings_select,
r_bookings_insert,
r_bookings_update,
r_bookings_delete,
r_facilities_select,
r_facilities_insert,
r_facilities_update,
r_facilities_delete;

CREATE USER u_admin WITH NOLOGIN NOINHERIT CREATEDB;
GRANT ALL ON DATABASE main TO u_admin;
REVOKE CONNECT ON DATABASE main FROM u_admin;
GRANT ALL ON SCHEMA users, cd TO u_admin;
GRANT ALL ON ALL TABLES IN SCHEMA users, cd TO u_admin;

CREATE USER u_connection WITH LOGIN ENCRYPTED PASSWORD '' VALID UNTIL 'infinity' NOINHERIT IN GROUP
u_executioner,
u_student,
u_teacher,
u_admin;