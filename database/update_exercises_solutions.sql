UPDATE users.solutions
SET query = 
    CASE 
        WHEN id = 1 THEN 'select * from cd.facilities;'
        WHEN id = 2 THEN 'select name, membercost from cd.facilities;'
        WHEN id = 3 THEN 'select * from cd.facilities where membercost > 0;'
        WHEN id = 4 THEN 'select facid, name, membercost, monthlymaintenance from cd.facilities where membercost > 0 and (membercost < monthlymaintenance/50.0);'
        WHEN id = 5 THEN 'select * from cd.facilities where name like ''%Tennis%'';'
        WHEN id = 6 THEN 'select * from cd.facilities where facid in (1,5);'
        WHEN id = 7 THEN 'select name, case when (monthlymaintenance > 100) then ''expensive'' else ''cheap'' end as cost from cd.facilities;'
        WHEN id = 8 THEN 'select memid, surname, firstname, joindate from cd.members where joindate >= ''2012-09-01'';'
        WHEN id = 9 THEN 'select distinct surname from cd.members order by surname limit 10;'
        WHEN id = 10 THEN 'select surname from cd.members union select name from cd.facilities;'
        WHEN id = 11 THEN 'select max(joindate) as latest from cd.members;'
        WHEN id = 12 THEN 'select firstname, surname, joindate from cd.members where joindate = (select max(joindate) from cd.members);'
        WHEN id = 13 THEN 'select bks.starttime from cd.bookings bks inner join cd.members mems on mems.memid = bks.memid where mems.firstname=''David'' and mems.surname=''Farrell'';'
        WHEN id = 14 THEN 'select bks.starttime as start, facs.name as name from cd.facilities facs inner join cd.bookings bks on facs.facid = bks.facid where facs.name in (''Tennis Court 2'',''Tennis Court 1'') and bks.starttime >= ''2012-09-21'' and bks.starttime < ''2012-09-22'' order by bks.starttime;'
        WHEN id = 15 THEN 'select distinct recs.firstname as firstname, recs.surname as surname from cd.members mems inner join cd.members recs on recs.memid = mems.recommendedby order by surname, firstname;'
        WHEN id = 16 THEN 'select mems.firstname as memfname, mems.surname as memsname, recs.firstname as recfname, recs.surname as recsname from cd.members mems left outer join cd.members recs on recs.memid = mems.recommendedby order by memsname, memfname;'
        WHEN id = 17 THEN 'select distinct mems.firstname || '' '' || mems.surname as member, facs.name as facility from cd.members mems inner join cd.bookings bks on mems.memid = bks.memid inner join cd.facilities facs on bks.facid = facs.facid where facs.name in (''Tennis Court 2'',''Tennis Court 1'') order by member, facility;'
        WHEN id = 18 THEN 'select mems.firstname || '' '' || mems.surname as member, facs.name as facility, case when mems.memid = 0 then bks.slots*facs.guestcost else bks.slots*facs.membercost end as cost from cd.members mems inner join cd.bookings bks on mems.memid = bks.memid inner join cd.facilities facs on bks.facid = facs.facid where bks.starttime >= ''2012-09-14'' and bks.starttime < ''2012-09-15'' and ( (mems.memid = 0 and bks.slots*facs.guestcost > 30) or (mems.memid != 0 and bks.slots*facs.membercost > 30) ) order by cost desc;'
        WHEN id = 19 THEN 'select distinct mems.firstname || '' '' || mems.surname as member, (select recs.firstname || '' '' || recs.surname as recommender from cd.members recs where recs.memid = mems.recommendedby ) from cd.members mems order by member;'
        WHEN id = 20 THEN 'select member, facility, cost from ( select mems.firstname || '' '' || mems.surname as member, facs.name as facility, case when mems.memid = 0 then bks.slots*facs.guestcost else bks.slots*facs.membercost end as cost from cd.members mems inner join cd.bookings bks on mems.memid = bks.memid inner join cd.facilities facs on bks.facid = facs.facid where bks.starttime >= ''2012-09-14'' and bks.starttime < ''2012-09-15'' ) as bookings where cost > 30 order by cost desc;'
        WHEN id = 21 THEN 'insert into cd.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) values (9, ''Spa'', 20, 30, 100000, 800);'
        WHEN id = 22 THEN 'insert into cd.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) values (9, ''Spa'', 20, 30, 100000, 800), (10, ''Squash Court 2'', 3.5, 17.5, 5000, 80);'
        WHEN id = 23 THEN 'insert into cd.facilities (facid, name, membercost, guestcost, initialoutlay, monthlymaintenance) select (select max(facid) from cd.facilities)+1, ''Spa'', 20, 30, 100000, 800;'
        WHEN id = 24 THEN 'update cd.facilities set initialoutlay = 10000 where facid = 1;'
        WHEN id = 25 THEN 'update cd.facilities set membercost = 6, guestcost = 30 where facid in (0,1);'
        WHEN id = 26 THEN 'update cd.facilities facs set membercost = (select membercost * 1.1 from cd.facilities where facid = 0), guestcost = (select guestcost * 1.1 from cd.facilities where facid = 0) where facs.facid = 1;'
        WHEN id = 27 THEN 'delete from cd.bookings;'
        WHEN id = 28 THEN 'delete from cd.members where memid = 37;'
        WHEN id = 29 THEN 'delete from cd.members where memid not in (select memid from cd.bookings);'
        WHEN id = 30 THEN 'select count(*) from cd.facilities;'
        WHEN id = 31 THEN 'select count(*) from cd.facilities where guestcost >= 10;'
        WHEN id = 32 THEN 'select recommendedby, count(*) from cd.members where recommendedby is not null group by recommendedby order by recommendedby;'
        WHEN id = 33 THEN 'select facid, sum(slots) as "Total Slots" from cd.bookings group by facid order by facid;'
        WHEN id = 34 THEN 'select facid, sum(slots) as "Total Slots" from cd.bookings where starttime >= ''2012-09-01'' and starttime < ''2012-10-01'' group by facid order by sum(slots);'
        WHEN id = 35 THEN 'select facid, extract(month from starttime) as month, sum(slots) as "Total Slots" from cd.bookings where extract(year from starttime) = 2012 group by facid, month order by facid, month;'
        WHEN id = 36 THEN 'select count(distinct memid) from cd.bookings;'
        WHEN id = 37 THEN 'select facid, sum(slots) as "Total Slots" from cd.bookings group by facid having sum(slots) > 1000 order by facid;'
        WHEN id = 38 THEN 'select facs.name, sum(slots * case when memid = 0 then facs.guestcost else facs.membercost end) as revenue from cd.bookings bks inner join cd.facilities facs on bks.facid = facs.facid group by facs.name order by revenue;'
        WHEN id = 39 THEN 'select name, revenue from ( select facs.name, sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) as revenue from cd.bookings bks inner join cd.facilities facs on bks.facid = facs.facid group by facs.name ) as agg where revenue < 1000 order by revenue;'
        WHEN id = 40 THEN 'select facid, sum(slots) as "Total Slots" from cd.bookings group by facid order by sum(slots) desc LIMIT 1;'
        WHEN id = 41 THEN 'select facid, extract(month from starttime) as month, sum(slots) as slots from cd.bookings where starttime >= ''2012-01-01'' and starttime < ''2013-01-01'' group by rollup(facid, month) order by facid, month;'
        WHEN id = 42 THEN 'select facs.facid, facs.name, trim(to_char(sum(bks.slots)/2.0, ''9999999999999999D99'')) as "Total Hours" from cd.bookings bks inner join cd.facilities facs on facs.facid = bks.facid group by facs.facid, facs.name order by facs.facid;'
        WHEN id = 43 THEN 'select mems.surname, mems.firstname, mems.memid, min(bks.starttime) as starttime from cd.bookings bks inner join cd.members mems on mems.memid = bks.memid where starttime >= ''2012-09-01'' group by mems.surname, mems.firstname, mems.memid order by mems.memid;'
        WHEN id = 44 THEN 'select count(*) over(), firstname, surname from cd.members order by joindate;'
        WHEN id = 45 THEN 'select row_number() over(order by joindate), firstname, surname from cd.members order by joindate;'
        WHEN id = 46 THEN 'select facid, total from ( select facid, sum(slots) total, rank() over (order by sum(slots) desc) rank from cd.bookings group by facid ) as ranked where rank = 1;'
        WHEN id = 47 THEN 'select firstname, surname, ((sum(bks.slots)+10)/20)*10 as hours, rank() over (order by ((sum(bks.slots)+10)/20)*10 desc) as rank from cd.bookings bks inner join cd.members mems on bks.memid = mems.memid group by mems.memid order by rank, surname, firstname;'
        WHEN id = 48 THEN 'select name, rank from ( select facs.name as name, rank() over (order by sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) desc) as rank from cd.bookings bks inner join cd.facilities facs on bks.facid = facs.facid group by facs.name ) as subq where rank <= 3 order by rank;'
        WHEN id = 49 THEN 'select facs.name as name, facs.initialoutlay/((sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end)/3) - facs.monthlymaintenance) as months from cd.bookings bks inner join cd.facilities facs on bks.facid = facs.facid group by facs.facid order by name;'
        WHEN id = 50 THEN 'select dategen.date, ( select sum(case when memid = 0 then slots * facs.guestcost else slots * membercost end) as rev from cd.bookings bks inner join cd.facilities facs on bks.facid = facs.facid where bks.starttime > dategen.date - (interval ''14 days'') and bks.starttime < dategen.date + (interval ''1 day'') )/15 as revenue from ( select cast(generate_series(timestamp ''2012-08-01'', ''2012-08-31'',''1 day'') as date) as date ) as dategen order by dategen.date;'
        WHEN id = 51 THEN 'select timestamp ''2012-08-31 01:00:00'';'
        WHEN id = 52 THEN 'select timestamp ''2012-08-31 01:00:00'' - timestamp ''2012-07-30 01:00:00'' as interval;'
        WHEN id = 53 THEN 'select generate_series(timestamp ''2012-10-01'', timestamp ''2012-10-31'', interval ''1 day'') as ts;'
        WHEN id = 54 THEN 'select extract(day from timestamp ''2012-08-31'');'
        WHEN id = 55 THEN 'select extract(epoch from (timestamp ''2012-09-02 00:00:00'' - ''2012-08-31 01:00:00''));'
        WHEN id = 56 THEN 'select extract(month from cal.month) as month, (cal.month + interval ''1 month'') - cal.month as length from ( select generate_series(timestamp ''2012-01-01'', timestamp ''2012-12-01'', interval ''1 month'') as month ) cal order by month;'
        WHEN id = 57 THEN 'select (date_trunc(''month'',ts.testts) + interval ''1 month'') - date_trunc(''day'', ts.testts) as remaining from (select timestamp ''2012-02-11 01:00:00'' as testts) ts;'
        WHEN id = 58 THEN 'select starttime, starttime + slots*(interval ''30 minutes'') endtime from cd.bookings order by endtime desc, starttime desc limit 10;'
        WHEN id = 59 THEN 'select date_trunc(''month'', starttime) as month, count(*) from cd.bookings group by month order by month;'
        WHEN id = 60 THEN 'select name, month, round((100*slots)/ cast( 25*(cast((month + interval ''1 month'') as date) - cast (month as date)) as numeric),1) as utilisation from ( select facs.name as name, date_trunc(''month'', starttime) as month, sum(slots) as slots from cd.bookings bks inner join cd.facilities facs on bks.facid = facs.facid group by facs.facid, month ) as inn order by name, month;'
        WHEN id = 61 THEN 'select surname || '', '' || firstname as name from cd.members;'
        WHEN id = 62 THEN 'select * from cd.facilities where name like ''Tennis%'';'
        WHEN id = 63 THEN 'select * from cd.facilities where upper(name) like ''TENNIS%'';'
        WHEN id = 64 THEN 'select lpad(cast(zipcode as char(5)),5,''0'') zip from cd.members order by zip;'
        WHEN id = 65 THEN 'select substr (mems.surname,1,1) as letter, count(*) as count from cd.members mems group by letter order by letter;'
        WHEN id = 66 THEN 'select memid, translate(telephone, ''-() '', '''') as telephone from cd.members order by memid;'
        WHEN id = 67 THEN 'with RECURSIVE recommenders(recommender) as ( select recommendedby from cd.members where memid = 27 union all select mems.recommendedby from recommenders recs inner join cd.members mems on mems.memid = recs.recommender ) select recs.recommender, mems.firstname, mems.surname from recommenders recs inner join cd.members mems on recs.recommender = mems.memid order by memid desc;'
        WHEN id = 68 THEN 'with RECURSIVE recommendeds(memid) as ( select memid from cd.members where recommendedby = 1 union all select mems.memid from recommendeds recs inner join cd.members mems on mems.recommendedby = recs.memid ) select recs.memid, mems.firstname, mems.surname from recommendeds recs inner join cd.members mems on recs.memid = mems.memid order by memid;'
        WHEN id = 69 THEN 'with RECURSIVE recommenders(recommender, member) as ( select recommendedby, memid from cd.members union all select mems.recommendedby, recs.member from recommenders recs inner join cd.members mems on mems.memid = recs.recommender ) select recs.member member, recs.recommender, mems.firstname, mems.surname from recommenders recs inner join cd.members mems on recs.recommender = mems.memid where recs.member = 22 or recs.member = 12 order by recs.member asc, recs.recommender desc;'
    END
WHERE id BETWEEN 1 AND 69;