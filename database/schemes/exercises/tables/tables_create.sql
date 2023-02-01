-- CREATE TABLE exercises.members (
--     id SERIAL PRIMARY KEY,
--     surname VARCHAR(200) NOT NULL,
--     firstname VARCHAR(200) NOT NULL,
--     address VARCHAR(300) NOT NULL,
--     zipcode INT NOT NULL,
--     telephone VARCHAR(20) NOT NULL,
--     recommendedby INT,
--     joindate TIMESTAMP WITHOUT TIME ZONE NOT NULL
-- );

-- CREATE TABLE exercises.facilities (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     membercost DECIMAL NOT NULL,
--     guestcost DECIMAL NOT NULL,
--     initialoutlay DECIMAL NOT NULL,
--     monthlymaintenance DECIMAL NOT NULL
-- );

-- CREATE TABLE exercises.bookings (
--     id SERIAL PRIMARY KEY,
--     member_id INT,
--     facility_id INT NOT NULL,
--     starttime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
--     slots INT NOT NULL,
--     FOREIGN KEY (member_id) REFERENCES exercises.members(id) ON UPDATE CASCADE ON DELETE RESTRICT,
--     FOREIGN KEY (facility_id) REFERENCES exercises.facilities(id) ON UPDATE CASCADE ON DELETE RESTRICT
-- );

CREATE TABLE cd.members (
    memid INTEGER NOT NULL,
    surname CHARACTER VARYING(200) NOT NULL,
    firstname CHARACTER VARYING(200) NOT NULL,
    address CHARACTER VARYING(300) NOT NULL,
    zipcode INTEGER NOT NULL,
    telephone CHARACTER VARYING(20) NOT NULL,
    recommendedby INTEGER,
    joindate TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE cd.facilities (
    facid INTEGER NOT NULL,
    name CHARACTER VARYING(100) NOT NULL,
    membercost NUMERIC NOT NULL,
    guestcost NUMERIC NOT NULL,
    initialoutlay NUMERIC NOT NULL,
    monthlymaintenance NUMERIC NOT NULL
);

CREATE TABLE cd.bookings (
    bookid INTEGER NOT NULL,
    facid INTEGER NOT NULL,
    memid INTEGER NOT NULL,
    starttime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    slots INTEGER NOT NULL
);
