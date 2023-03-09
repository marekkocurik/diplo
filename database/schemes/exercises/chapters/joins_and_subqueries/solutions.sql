INSERT INTO users.solutions(user_id, exercise_id, query) VALUES
(1, 13, 'select bks.starttime from cd.bookings bks inner join cd.members mems on mems.memid = bks.memid where mems.firstname=''David'' and mems.surname=''Farrell'';'),
(1, 14, 'select bks.starttime as start, facs.name as name from cd.facilities facs inner join cd.bookings bks on facs.facid = bks.facid where facs.name in (''Tennis Court 2'',''Tennis Court 1'') and bks.starttime >= ''2012-09-21'' and bks.starttime < ''2012-09-22'' order by bks.starttime;'),
(1, 15, 'select distinct recs.firstname as firstname, recs.surname as surname from cd.members mems inner join cd.members recs on recs.memid = mems.recommendedby order by surname, firstname;'),
(1, 16, 'select mems.firstname as memfname, mems.surname as memsname, recs.firstname as recfname, recs.surname as recsname from cd.members mems left outer join cd.members recs on recs.memid = mems.recommendedby order by memsname, memfname;'),
(1, 17, 'select distinct mems.firstname || '' '' || mems.surname as member, facs.name as facility from cd.members mems inner join cd.bookings bks on mems.memid = bks.memid inner join cd.facilities facs on bks.facid = facs.facid where facs.name in (''Tennis Court 2'',''Tennis Court 1'') order by member, facility;'),
(1, 18, 'select mems.firstname || '' '' || mems.surname as member, facs.name as facility, case when mems.memid = 0 then bks.slots*facs.guestcost else bks.slots*facs.membercost end as cost from cd.members mems inner join cd.bookings bks on mems.memid = bks.memid inner join cd.facilities facs on bks.facid = facs.facid where bks.starttime >= ''2012-09-14'' and bks.starttime < ''2012-09-15'' and ( (mems.memid = 0 and bks.slots*facs.guestcost > 30) or (mems.memid != 0 and bks.slots*facs.membercost > 30) ) order by cost desc;'),
(1, 19, 'select distinct mems.firstname || '' '' || mems.surname as member, (select recs.firstname || '' '' || recs.surname as recommender from cd.members recs where recs.memid = mems.recommendedby ) from cd.members mems order by member;'),
(1, 20, 'select member, facility, cost from ( select mems.firstname || '' '' || mems.surname as member, facs.name as facility, case when mems.memid = 0 then bks.slots*facs.guestcost else bks.slots*facs.membercost end as cost from cd.members mems inner join cd.bookings bks on mems.memid = bks.memid inner join cd.facilities facs on bks.facid = facs.facid where bks.starttime >= ''2012-09-14'' and bks.starttime < ''2012-09-15'' ) as bookings where cost > 30 order by cost desc;');