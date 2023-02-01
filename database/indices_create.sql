CREATE INDEX "cd.bookings.memid_facid" ON cd.bookings USING btree (memid, facid);

CREATE INDEX "cd.bookings.facid_memid" ON cd.bookings USING btree (facid, memid);

CREATE INDEX "cd.bookings.facid_starttime" ON cd.bookings USING btree (facid, starttime);

CREATE INDEX "cd.bookings.memid_starttime" ON cd.bookings USING btree (memid, starttime);

CREATE INDEX "cd.bookings.starttime" ON cd.bookings USING btree (starttime);

CREATE INDEX "cd.members.joindate" ON cd.members USING btree (joindate);

CREATE INDEX "cd.members.recommendedby" ON cd.members USING btree (recommendedby);