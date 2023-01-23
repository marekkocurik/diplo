INSERT INTO users.solutions(exercise_id, query) VALUES
(1, 'select * from exercises.facilities;'),
(2, 'select name, membercost from exercises.facilities;'),
(3, 'select * from exercises.facilities where membercost > 0;'),
(4, 'select facid, name, membercost, monthlymaintenance from exercises.facilities where membercost > 0 and (membercost < monthlymaintenance/50.0);'),
(5, 'select * from exercises.facilities where name like ''%Tennis%'';'),
(6, 'select * from exercises.facilities where facid in (1,5);'),
(7, 'select name, case when (monthlymaintenance > 100) then ''expensive'' else ''cheap'' end as cost from exercises.facilities;'),
(8, 'select memid, surname, firstname, joindate from exercises.members where joindate >= ''2012-09-01'';'),
(9, 'select distinct surname from exercises.members order by surname limit 10;'),
(10, 'select surname from exercises.members union select name from exercises.facilities;'),
(11, 'select max(joindate) as latest from exercises.members;'),
(12, 'select firstname, surname, joindate from exercises.members where joindate = (select max(joindate) from exercises.members);');