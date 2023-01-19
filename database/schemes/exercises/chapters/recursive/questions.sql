INSERT INTO users.exercises(chapter_id, name, question) VALUES
(7, 'Find the upward recommendation chain for member ID 27', 'Find the upward recommendation chain for member ID 27: that is, the member who recommended them, and the member who recommended that member, and so on. Return member ID, first name, and surname. Order by descending member id.'),
(7, 'Find the downward recommendation chain for member ID 1', 'Find the downward recommendation chain for member ID 1: that is, the members they recommended, the members those members recommended, and so on. Return member ID and name, and order by ascending member id.'),
(7, 'Produce a CTE that can return the upward recommendation chain for any member', 'Produce a CTE that can return the upward recommendation chain for any member. You should be able to <c>select recommender from recommenders where member=x</c>. Demonstrate it by getting the chains for members 12 and 22. Results table should have member and recommender, ordered by member ascending, recommender descending.');