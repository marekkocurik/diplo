ALTER TABLE ONLY exercises.bookings ADD CONSTRAINT bookings_pk PRIMARY KEY (bookid);

ALTER TABLE ONLY exercises.facilities ADD CONSTRAINT facilities_pk PRIMARY KEY (facid);

ALTER TABLE ONLY exercises.members ADD CONSTRAINT members_pk PRIMARY KEY (memid);

ALTER TABLE ONLY exercises.bookings ADD CONSTRAINT fk_bookings_facid FOREIGN KEY (facid) REFERENCES exercises.facilities(facid);

ALTER TABLE ONLY exercises.bookings ADD CONSTRAINT fk_bookings_memid FOREIGN KEY (memid) REFERENCES exercises.members(memid);

ALTER TABLE ONLY exercises.members ADD CONSTRAINT fk_members_recommendedby FOREIGN KEY (recommendedby) REFERENCES exercises.members(memid) ON DELETE SET NULL;