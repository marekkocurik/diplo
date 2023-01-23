INSERT INTO users.solutions(exercise_id, query) VALUES
(30, 'select count(*) from exercises.facilities;'),
(31, 'select count(*) from exercises.facilities where guestcost >= 10;'),
(32, 'select recommendedby, count(*) from exercises.members where recommendedby is not null group by recommendedby order by recommendedby;'),
(33, 'select facid, sum(slots) as "Total Slots" from exercises.bookings group by facid order by facid;'),
(34, 'select facid, sum(slots) as "Total Slots" from exercises.bookings where starttime >= ''2012-09-01'' and starttime < ''2012-10-01'' group by facid order by sum(slots);'),
(35, 'select facid, extract(month from starttime) as month, sum(slots) as "Total Slots" from exercises.bookings where extract(year from starttime) = 2012 group by facid, month order by facid, month;'),
(36, 'select count(distinct memid) from exercises.bookings;'),
(37, 'select facid, sum(slots) as "Total Slots" from exercises.bookings group by facid having sum(slots) > 1000 order by facid;'),
(38, 'select facs.name, sum(slots * case when memid = 0 then facs.guestcost else facs.membercost end) as revenue from exercises.bookings bks inner join exercises.facilities facs on bks.facid = facs.facid group by facs.name order by revenue;'),
(39, 'select name, revenue from ( select facs.name, sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) as revenue from exercises.bookings bks inner join exercises.facilities facs on bks.facid = facs.facid group by facs.name ) as agg where revenue < 1000 order by revenue;'),
(40, 'select facid, sum(slots) as "Total Slots" from exercises.bookings group by facid order by sum(slots) desc LIMIT 1;'),
(41, 'select facid, extract(month from starttime) as month, sum(slots) as slots from exercises.bookings where starttime >= ''2012-01-01'' and starttime < ''2013-01-01'' group by rollup(facid, month) order by facid, month;'),
(42, 'select facs.facid, facs.name, trim(to_char(sum(bks.slots)/2.0, ''9999999999999999D99'')) as "Total Hours" from exercises.bookings bks inner join exercises.facilities facs on facs.facid = bks.facid group by facs.facid, facs.name order by facs.facid;'),
(43, 'select mems.surname, mems.firstname, mems.memid, min(bks.starttime) as starttime from exercises.bookings bks inner join exercises.members mems on mems.memid = bks.memid where starttime >= ''2012-09-01'' group by mems.surname, mems.firstname, mems.memid order by mems.memid;'),
(44, 'select count(*) over(), firstname, surname from exercises.members order by joindate;'),
(45, 'select row_number() over(order by joindate), firstname, surname from exercises.members order by joindate;'),
(46, 'select facid, total from ( select facid, sum(slots) total, rank() over (order by sum(slots) desc) rank from exercises.bookings group by facid ) as ranked where rank = 1;'),
(47, 'select firstname, surname, ((sum(bks.slots)+10)/20)*10 as hours, rank() over (order by ((sum(bks.slots)+10)/20)*10 desc) as rank from exercises.bookings bks inner join exercises.members mems on bks.memid = mems.memid group by mems.memid order by rank, surname, firstname;'),
(48, 'select name, rank from ( select facs.name as name, rank() over (order by sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) desc) as rank from exercises.bookings bks inner join exercises.facilities facs on bks.facid = facs.facid group by facs.name ) as subq where rank <= 3 order by rank;'),
(49, 'select name, case when class=1 then ''high'' when class=2 then ''average'' else ''low'' end revenue from ( select facs.name as name, ntile(3) over (order by sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) desc) as class from exercises.bookings bks inner join exercises.facilities facs on bks.facid = facs.facid group by facs.name ) as subq order by class, name;'),
(50, 'select facs.name as name, facs.initialoutlay/((sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end)/3) - facs.monthlymaintenance) as months from exercises.bookings bks inner join exercises.facilities facs on bks.facid = facs.facid group by facs.facid order by name;'),
(51, 'select dategen.date, ( select sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) as rev from exercises.bookings bks inner join exercises.facilities facs on bks.facid = facs.facid where bks.starttime > dategen.date - interval ''14 days'' and bks.starttime < dategen.date + interval ''1 day'' )/15 as revenue from ( select cast(generate_series(timestamp ''2012-08-01'', ''2012-08-31'',''1 day'') as date) as date ) as dategen order by dategen.date;');