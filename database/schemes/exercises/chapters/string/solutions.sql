INSERT INTO users.solutions(exercise_id, query) VALUES
(61, 'select surname || '', '' || firstname as name from cd.members;'),
(62, 'select * from cd.facilities where name like ''Tennis%'';'),
(63, 'select * from cd.facilities where upper(name) like ''TENNIS%'';'),
(64, 'select lpad(cast(zipcode as char(5)),5,''0'') zip from cd.members order by zip;'),
(65, 'select substr (mems.surname,1,1) as letter, count(*) as count from cd.members mems group by letter order by letter;'),
(66, 'select memid, translate(telephone, ''-() '', '''') as telephone from cd.members order by memid;');