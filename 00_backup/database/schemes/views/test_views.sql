-- vytvorenie test_view:
CREATE VIEW exercises.test_view AS
	SELECT surname, firstname, zipcode
	FROM exercises.members
	LIMIT 5;

-- select test_view
SELECT * FROM exercises.test_view;

-- pridanie noveho stlpca do test_view (odobranie stlpca nie je mozne!)
CREATE OR REPLACE VIEW exercises.test_view AS
	SELECT surname, firstname, zipcode, address
	FROM exercises.members
	LIMIT 5;
	
-- DROP VIEW
DROP VIEW exercises.test_view;



-- test use case 1 WITH CHECK OPTIONS

SELECT * FROM exercises.test_members;

CREATE OR REPLACE VIEW exercises.test_view AS
	SELECT *
	FROM exercises.test_members
	WHERE exercises.test_members.memid <= 5;
	
SELECT * FROM exercises.test_view;

DROP VIEW exercises.test_view;

INSERT INTO exercises.test_view(memid, surname, firstname, address) VALUES (13, 'surname3', 'firstname3', 'addr3');

CREATE USER u_test_view;
CREATE USER u_test_view2;

SET ROLE u_test_view;

SET ROLE postgres;

GRANT ALL PRIVILEGES ON DATABASE test TO u_test_view;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA exercises TO u_test_view;
GRANT USAGE ON SCHEMA exercises TO u_test_view;
REVOKE ALL PRIVILEGES ON exercises.test_view FROM u_test_view;
GRANT SELECT ON exercises.test_view TO u_test_view2;



-- test use case: user ma SELECT nad table, FULL nad view, a ze ci dokaze updatnut VIEW bez updatovania table

SELECT * FROM exercises.test_members;

CREATE OR REPLACE VIEW exercises.test_view2
	AS
	SELECT *
	FROM exercises.test_members
	WITH CHECK OPTION;
	
SELECT * FROM exercises.test_view2;

DROP VIEW exercises.test_view;

INSERT INTO exercises.test_view2(memid, surname, firstname, address) VALUES (13, 'surname3', 'firstname3', 'addr3');

CREATE USER u_test_view;
CREATE USER u_test_view2;

SET ROLE u_test_view;

SET ROLE postgres;

GRANT ALL PRIVILEGES ON DATABASE test TO u_test_view;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA exercises TO u_test_view;
GRANT USAGE ON SCHEMA exercises TO u_test_view;
REVOKE ALL PRIVILEGES ON exercises.test_view FROM u_test_view;
GRANT SELECT ON exercises.test_members TO u_test_view;
REVOKE ALL ON exercises.test_members FROM u_test_view;
GRANT CREATE ON SCHEMA exercises TO u_test_view;
GRANT ALL ON exercises.test_view2 TO u_test_view;