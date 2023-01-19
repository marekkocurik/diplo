CREATE INDEX "exercises.bookings.memid_facid" ON exercises.bookings USING btree (memid, facid);

CREATE INDEX "exercises.bookings.facid_memid" ON exercises.bookings USING btree (facid, memid);

CREATE INDEX "exercises.bookings.facid_starttime" ON exercises.bookings USING btree (facid, starttime);

CREATE INDEX "exercises.bookings.memid_starttime" ON exercises.bookings USING btree (memid, starttime);

CREATE INDEX "exercises.bookings.starttime" ON exercises.bookings USING btree (starttime);

CREATE INDEX "exercises.members.joindate" ON exercises.members USING btree (joindate);

CREATE INDEX "exercises.members.recommendedby" ON exercises.members USING btree (recommendedby);