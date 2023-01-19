INSERT INTO users.solutions(exercise_id, query) VALUES
(62, 'select surname || '', '' || firstname as name from cd.members'),
(63, 'select * from cd.facilities where name like ''Tennis%'';'),
(64, 'select * from cd.facilities where upper(name) like ''TENNIS%'';'),
(65, 'select memid, telephone from cd.members where telephone ~ ''[()]'';'),
(66, 'select lpad(cast(zipcode as char(5)),5,''0'') zip from cd.members order by zip'),
(67, 'select substr (mems.surname,1,1) as letter, count(*) as countfrom cd.members mems group by letter order by letter'),
(68, 'select memid, translate(telephone, ''-() '', '''') as telephone from cd.members order by memid;');