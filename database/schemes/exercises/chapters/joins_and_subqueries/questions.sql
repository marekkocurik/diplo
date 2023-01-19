INSERT INTO users.exercises(chapter_id, name, question) VALUES
(2, 'Retrieve the start times of members'' bookings', 'How can you produce a list of the start times for bookings by members named ''David Farrell''?'),
(2, 'Work out the start times of bookings for tennis courts', 'How can you produce a list of the start times for bookings for tennis courts, for the date ''2012-09-21''? Return a list of start time and facility name pairings, ordered by the time.'),
(2, 'Produce a list of all members who have recommended another member', 'How can you output a list of all members who have recommended another member? Ensure that there are no duplicates in the list, and that results are ordered by (surname, firstname).'),
(2, 'Produce a list of all members, along with their recommender', 'How can you output a list of all members, including the individual who recommended them (if any)? Ensure that results are ordered by (surname, firstname).'),
(2, 'Produce a list of all members who have used a tennis court', 'How can you produce a list of all members who have used a tennis court? Include in your output the name of the court, and the name of the member formatted as a single column. Ensure no duplicate data, and order by the member name followed by the facility name.'),
(2, 'Produce a list of costly bookings', 'How can you produce a list of bookings on the day of 2012-09-14 which will cost the member (or guest) more than $30? Remember that guests have different costs to members (the listed costs are per half-hour ''slot''), and the guest user is always ID 0. Include in your output the name of the facility, the name of the member formatted as a single column, and the cost. Order by descending cost, and do not use any subqueries.'),
(2, 'Produce a list of all members, along with their recommender, using no joins.', 'How can you output a list of all members, including the individual who recommended them (if any), without using any joins? Ensure that there are no duplicates in the list, and that each firstname + surname pairing is formatted as a column and ordered.'),
(2, 'Produce a list of costly bookings, using a subquery', 'Previous exercise contained some messy logic: we had to calculate the booking cost in both the <c>WHERE</c> clause and the <c>CASE</c> statement. Try to simplify this calculation using subqueries. For reference, the question was:</p><p><i>How can you produce a list of bookings on the day of 2012-09-14 which will cost the member (or guest) more than $30? Remember that guests have different costs to members (the listed costs are per half-hour ''slot''), and the guest user is always ID 0. Include in your output the name of the facility, the name of the member formatted as a single column, and the cost. Order by descending cost.</i>');