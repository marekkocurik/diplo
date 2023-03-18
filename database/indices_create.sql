CREATE INDEX "cd.bookings.memid_facid" ON cd.bookings USING btree (memid, facid);
CREATE INDEX "cd2.bookings.memid_facid" ON cd2.bookings USING btree (memid, facid);

CREATE INDEX "cd.bookings.facid_memid" ON cd.bookings USING btree (facid, memid);
CREATE INDEX "cd2.bookings.facid_memid" ON cd2.bookings USING btree (facid, memid);

CREATE INDEX "cd.bookings.facid_starttime" ON cd.bookings USING btree (facid, starttime);
CREATE INDEX "cd2.bookings.facid_starttime" ON cd2.bookings USING btree (facid, starttime);

CREATE INDEX "cd.bookings.memid_starttime" ON cd.bookings USING btree (memid, starttime);
CREATE INDEX "cd2.bookings.memid_starttime" ON cd2.bookings USING btree (memid, starttime);

CREATE INDEX "cd.bookings.starttime" ON cd.bookings USING btree (starttime);
CREATE INDEX "cd2.bookings.starttime" ON cd2.bookings USING btree (starttime);

CREATE INDEX "cd.members.joindate" ON cd.members USING btree (joindate);
CREATE INDEX "cd2.members.joindate" ON cd2.members USING btree (joindate);

CREATE INDEX "cd.members.recommendedby" ON cd.members USING btree (recommendedby);
CREATE INDEX "cd2.members.recommendedby" ON cd2.members USING btree (recommendedby);