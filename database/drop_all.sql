REVOKE u_executioner, u_student, u_teacher, u_admin FROM u_connection;

REVOKE
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
r_facilities_delete
FROM u_executioner;

REVOKE
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
r_facilities_delete
FROM u_student;

REVOKE
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
r_facilities_delete
FROM u_teacher;

REVOKE ALL ON ALL TABLES IN SCHEMA users, cd FROM u_admin;
REVOKE ALL ON SCHEMA users, cd FROM u_admin;
REVOKE ALL ON DATABASE test FROM u_admin;

REVOKE ALL ON ALL TABLES IN SCHEMA users FROM
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
 r_solutions_insert;

 REVOKE ALL ON ALL TABLES IN SCHEMA cd FROM
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

REVOKE ALL ON SCHEMA users FROM
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
r_solutions_insert;

REVOKE ALL ON SCHEMA cd FROM
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

DROP ROLE IF EXISTS u_connection;
DROP ROLE IF EXISTS u_admin;
DROP ROLE IF EXISTS u_teacher;
DROP ROLE IF EXISTS u_student;
DROP ROLE IF EXISTS u_executioner;

DROP ROLE IF EXISTS r_tokens_select;
DROP ROLE IF EXISTS r_tokens_insert;
DROP ROLE IF EXISTS r_tokens_update;
DROP ROLE IF EXISTS r_ratings_select;
DROP ROLE IF EXISTS r_ratings_insert;
DROP ROLE IF EXISTS r_ratings_update;
DROP ROLE IF EXISTS r_users_select;
DROP ROLE IF EXISTS r_users_insert;
DROP ROLE IF EXISTS r_users_update;
DROP ROLE IF EXISTS r_users_to_roles_select;
DROP ROLE IF EXISTS r_users_to_roles_insert;
DROP ROLE IF EXISTS r_roles_select;
DROP ROLE IF EXISTS r_roles_insert;
DROP ROLE IF EXISTS r_users_to_chapters_select;
DROP ROLE IF EXISTS r_users_to_chapters_insert;
DROP ROLE IF EXISTS r_chapters_select;
DROP ROLE IF EXISTS r_exercises_select;
DROP ROLE IF EXISTS r_answers_select;
DROP ROLE IF EXISTS r_answers_insert;
DROP ROLE IF EXISTS r_solutions_select;
DROP ROLE IF EXISTS r_solutions_insert;
DROP ROLE IF EXISTS r_members_select;
DROP ROLE IF EXISTS r_members_insert;
DROP ROLE IF EXISTS r_members_update;
DROP ROLE IF EXISTS r_members_delete;
DROP ROLE IF EXISTS r_bookings_select;
DROP ROLE IF EXISTS r_bookings_insert;
DROP ROLE IF EXISTS r_bookings_update;
DROP ROLE IF EXISTS r_bookings_delete;
DROP ROLE IF EXISTS r_facilities_select;
DROP ROLE IF EXISTS r_facilities_insert;
DROP ROLE IF EXISTS r_facilities_update;
DROP ROLE IF EXISTS r_facilities_delete;

DROP TABLE users.tokens;
DROP TABLE users.ratings;
DROP TABLE users.answers;
DROP TABLE users.solutions;
DROP TABLE users.exercises;
DROP TABLE users.users_to_chapters;
DROP TABLE users.users_to_roles;
DROP TABLE users.chapters;
DROP TABLE users.roles;
DROP TABLE users.users;
DROP TABLE cd.bookings;
DROP TABLE cd.members;
DROP TABLE cd.facilities;

DROP SCHEMA IF EXISTS public;
DROP SCHEMA IF EXISTS users;
DROP SCHEMA IF EXISTS cd;
