ALTER TABLE ONLY cd.bookings ADD CONSTRAINT bookings_pk PRIMARY KEY (bookid);

ALTER TABLE ONLY cd.facilities ADD CONSTRAINT facilities_pk PRIMARY KEY (facid);

ALTER TABLE ONLY cd.members ADD CONSTRAINT members_pk PRIMARY KEY (memid);

ALTER TABLE ONLY cd.bookings ADD CONSTRAINT fk_bookings_facid FOREIGN KEY (facid) REFERENCES cd.facilities(facid);

ALTER TABLE ONLY cd.bookings ADD CONSTRAINT fk_bookings_memid FOREIGN KEY (memid) REFERENCES cd.members(memid);

ALTER TABLE ONLY cd.members ADD CONSTRAINT fk_members_recommendedby FOREIGN KEY (recommendedby) REFERENCES cd.members(memid) ON DELETE SET NULL;