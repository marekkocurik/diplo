INSERT INTO users.exercises(chapter_id, name, question, exercise_order) VALUES
(3, 'Insert some data into a table', '<p>The club is adding a new facility - a spa. We need to add it into the facilities table. Use the following values:</p><ul><li>facid: 9, Name: ''Spa'', membercost: 20, guestcost: 30, initialoutlay: 100000, monthlymaintenance: 800.</li></ul>', 100),
(3, 'Insert multiple rows of data into a table', '<p>In the previous exercise, you learned how to add a facility. Now you''re going to add multiple facilities in one command. Use the following values:</p><ul><li>facid: 9, Name: ''Spa'', membercost: 20, guestcost: 30, initialoutlay: 100000, monthlymaintenance: 800.</li><li>facid: 10, Name: ''Squash Court 2'', membercost: 3.5, guestcost: 17.5, initialoutlay: 5000, monthlymaintenance: 80.</li></ul>', 200),
(3, 'Insert calculated data into a table', '<p>Let''s try adding the spa to the facilities table again. This time, though, we want to automatically generate the value for the next facid, rather than specifying it as a constant. Use the following values for everything else:</p><ul><li>Name: ''Spa'', membercost: 20, guestcost: 30, initialoutlay: 100000, monthlymaintenance: 800.</li></ul>', 300),
(3, 'Update some existing data', 'We made a mistake when entering the data for the second tennis court. The initial outlay was 10000 rather than 8000: you need to alter the data to fix the error.', 400),
(3, 'Update multiple rows and columns at the same time', 'We want to increase the price of the tennis courts for both members and guests. Update the costs to be 6 for members, and 30 for guests.', 500),
(3, 'Update a row based on the contents of another row', 'We want to alter the price of the second tennis court so that it costs 10% more than the first one. Try to do this without using constant values for the prices, so that we can reuse the statement if we want to.', 600),
(3, 'Delete all bookings', 'As part of a clearout of our database, we want to delete all bookings from the bookings table. How can we accomplish this?', 700),
(3, 'Delete a member from the members table', 'We want to remove member 37, who has never made a booking, from our database. How can we achieve that?', 800),
(3, 'Delete based on a subquery', 'In our previous exercises, we deleted a specific member who had never made a booking. How can we make that more general, to delete all members who have never made a booking?', 900);