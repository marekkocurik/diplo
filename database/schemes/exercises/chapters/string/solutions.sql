INSERT INTO users.solutions(exercise_id, query) VALUES
(62, 'select surname || '', '' || firstname as name from exercises.members;'),
(63, 'select * from exercises.facilities where name like ''Tennis%'';'),
(64, 'select * from exercises.facilities where upper(name) like ''TENNIS%'';'),
(65, 'select memid, telephone from exercises.members where telephone ~ ''[()]'';'),
(66, 'select lpad(cast(zipcode as char(5)),5,''0'') zip from exercises.members order by zip;'),
(67, 'select substr (mems.surname,1,1) as letter, count(*) as count from exercises.members mems group by letter order by letter;'),
(68, 'select memid, translate(telephone, ''-() '', '''') as telephone from exercises.members order by memid;');