INSERT INTO users.exercises(chapter_id, name, question) VALUES
(1, 'Retrieve everything from a table', 'How can you retrieve all the information from the exercises.facilities table?'),
(1, 'Retrieve specific columns from a table', 'You want to print out a list of all of the facilities and their cost to members. How would you retrieve a list of only facility names and costs?'),
(1, 'Control which rows are retrieved', 'How can you produce a list of facilities that charge a fee to members?'),
(1, 'Control which rows are retrieved - part 2', 'How can you produce a list of facilities that charge a fee to members, and that fee is less than 1/50th of the monthly maintenance cost? Return the facid, facility name, member cost, and monthly maintenance of the facilities in question.'),
(1, 'Basic string searches', 'How can you produce a list of all facilities with the word "Tennis" in their name?'),
(1, 'Matching against multiple possible values', 'How can you retrieve the details of facilities with ID 1 and 5? Try to do it without using the <em>OR</em> operator.'),
(1, 'Classify results into buckets', 'How can you produce a list of facilities, with each labelled as "cheap" or "expensive" depending on if their monthly maintenance cost is more than $100? Return the name and monthly maintenance of the facilities in question.'),
(1, 'Working with dates', 'How can you produce a list of members who joined after the start of September 2012? Return the memid, surname, firstname, and joindate of the members in question.'),
(1, 'Removing duplicates, and ordering results', 'How can you produce an ordered list of the first 10 surnames in the members table? The list must not contain duplicates.'),
(1, 'Combining results from multiple queries', 'You, for some reason, want a combined list of all surnames and all facility names. Yes, this is a contrived example :-). Produce that list!'),
(1, 'Simple aggregation', 'You''d like to get the signup date of your last member. How can you retrieve this information?'),
(1, 'More aggregation', 'You''d like to get the first and last name of the last member(s) who signed up - not just the date. How can you do that?');