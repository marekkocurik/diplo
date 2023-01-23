INSERT INTO users.solutions(exercise_id, query) VALUES
(21, 'insert into exercises.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) values (9, ''Spa'', 20, 30, 100000, 800);'),
(22, 'insert into exercises.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) values (9, ''Spa'', 20, 30, 100000, 800), (10, ''Squash Court 2'', 3.5, 17.5, 5000, 80);'),
(23, 'insert into exercises.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) select (select max(facid) from exercises.facilities)+1, ''Spa'', 20, 30, 100000, 800;'),
(24, 'update exercises.facilities set initialoutlay = 10000 where facid = 1;'),
(25, 'update exercises.facilities set membercost = 6, guestcost = 30 where facid in (0,1);'),
(26, 'update exercises.facilities facs set membercost = (select membercost * 1.1 from exercises.facilities where facid = 0), guestcost = (select guestcost * 1.1 from exercises.facilities where facid = 0) where facs.facid = 1;'),
(27, 'delete from exercises.bookings;'),
(28, 'delete from exercises.members where memid = 37;'),
(29, 'delete from exercises.members where memid not in (select memid from exercises.bookings);');