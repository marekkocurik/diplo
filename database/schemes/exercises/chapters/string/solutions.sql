INSERT INTO users.solutions(user_id, exercise_id, query) VALUES
(1, 62, 'select surname || '', '' || firstname as name from cd.members;'),
(1, 63, 'select * from cd.facilities where name like ''Tennis%'';'),
(1, 64, 'select * from cd.facilities where upper(name) like ''TENNIS%'';'),
(1, 65, 'select memid, telephone from cd.members where telephone ~ ''[()]'';'),
(1, 66, 'select lpad(cast(zipcode as char(5)),5,''0'') zip from cd.members order by zip;'),
(1, 67, 'select substr (mems.surname,1,1) as letter, count(*) as count from cd.members mems group by letter order by letter;'),
(1, 68, 'select memid, translate(telephone, ''-() '', '''') as telephone from cd.members order by memid;');