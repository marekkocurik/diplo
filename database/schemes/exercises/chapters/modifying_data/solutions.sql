INSERT INTO users.solutions(user_id, exercise_id, query) VALUES
(1, 21, 'insert into cd.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) values (9, ''Spa'', 20, 30, 100000, 800);'),
(1, 22, 'insert into cd.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) values (9, ''Spa'', 20, 30, 100000, 800), (10, ''Squash Court 2'', 3.5, 17.5, 5000, 80);'),
(1, 23, 'insert into cd.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) select (select max(facid) from cd.facilities)+1, ''Spa'', 20, 30, 100000, 800;'),
(1, 24, 'update cd.facilities set initialoutlay = 10000 where facid = 1;'),
(1, 25, 'update cd.facilities set membercost = 6, guestcost = 30 where facid in (0,1);'),
(1, 26, 'update cd.facilities facs set membercost = (select membercost * 1.1 from cd.facilities where facid = 0), guestcost = (select guestcost * 1.1 from cd.facilities where facid = 0) where facs.facid = 1;'),
(1, 27, 'delete from cd.bookings;'),
(1, 28, 'delete from cd.members where memid = 37;'),
(1, 29, 'delete from cd.members where memid not in (select memid from cd.bookings);');