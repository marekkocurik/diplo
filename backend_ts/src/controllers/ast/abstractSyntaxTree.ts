import {
  getOriginalSolutions,
  getTableNamesAliasesAndColumnsFromQuery,
  replaceAsterixWithTableAndColumns,
  replaceTableAliasesWithTableName,
  specifyColumnsWithoutTables,
  removeTableAliases,
  removeColumnAliases,
  updateSolutionToUpperCase,
  queryToUpperCase,
  testCreateASTsForNormalizedQueries,
  updateSolutionNormalizedQuery,
  updateSolutionAST,
} from './lexicalAnalysis/analyzer';
import { sortASTAlphabetically } from './lexicalAnalysis/sorter';
import { queries } from './queries';

const { Parser } = require('node-sql-parser/build/postgresql');

const parser = new Parser();
const opt = { database: 'PostgresQL' };

export interface QueryCompare {
  id: number;
  original: string;
  normalized: string;
}

interface QueryCompareResponse {
  message: string;
  queries: QueryCompare[];
}

interface NormalizedQueryResponse {
  message: string;
  normalizedQuery: string;
}

interface CreateASTResponse {
  message: string;
  ast: string;
}

const checkResponse = (response: QueryCompare[]): QueryCompare[] => {
  let _new: QueryCompare[] = [];
  let goal = [
    {
      id: 1,
      query:
        'SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES;',
    },
    { id: 2, query: 'SELECT FACILITIES.NAME, FACILITIES.MEMBERCOST FROM CD.FACILITIES;' },
    {
      id: 3,
      query:
        'SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES WHERE FACILITIES.MEMBERCOST > 0;',
    },
    {
      id: 4,
      query:
        'SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES WHERE FACILITIES.MEMBERCOST > 0 AND (FACILITIES.MEMBERCOST < FACILITIES.MONTHLYMAINTENANCE/50.0);',
    },
    {
      id: 5,
      query:
        "SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES WHERE FACILITIES.NAME LIKE '%Tennis%';",
    },
    {
      id: 6,
      query:
        'SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES WHERE FACILITIES.FACID IN (1,5);',
    },
    {
      id: 7,
      query:
        "SELECT FACILITIES.NAME, CASE WHEN (FACILITIES.MONTHLYMAINTENANCE > 100) THEN 'expensive' ELSE 'cheap' END AS COST FROM CD.FACILITIES;",
    },
    {
      id: 8,
      query:
        "SELECT MEMBERS.MEMID, MEMBERS.SURNAME, MEMBERS.FIRSTNAME, MEMBERS.JOINDATE FROM CD.MEMBERS WHERE MEMBERS.JOINDATE >= '2012-09-01';",
    },
    { id: 9, query: 'SELECT DISTINCT MEMBERS.SURNAME FROM CD.MEMBERS ORDER BY MEMBERS.SURNAME LIMIT 10;' },
    { id: 10, query: 'SELECT MEMBERS.SURNAME FROM CD.MEMBERS UNION SELECT FACILITIES.NAME FROM CD.FACILITIES;' },
    { id: 11, query: 'SELECT MAX(MEMBERS.JOINDATE) AS LATEST FROM CD.MEMBERS;' },
    {
      id: 12,
      query:
        'SELECT MEMBERS.FIRSTNAME, MEMBERS.SURNAME, MEMBERS.JOINDATE FROM CD.MEMBERS WHERE MEMBERS.JOINDATE = (SELECT MAX(MEMBERS.JOINDATE) FROM CD.MEMBERS);',
    },
    {
      id: 13,
      query:
        "SELECT BOOKINGS.STARTTIME FROM CD.BOOKINGS INNER JOIN CD.MEMBERS ON MEMBERS.MEMID = BOOKINGS.MEMID WHERE MEMBERS.FIRSTNAME='David' AND MEMBERS.SURNAME='Farrell';",
    },
    {
      id: 14,
      query:
        "SELECT BOOKINGS.STARTTIME, FACILITIES.NAME FROM CD.FACILITIES INNER JOIN CD.BOOKINGS ON FACILITIES.FACID = BOOKINGS.FACID WHERE FACILITIES.NAME IN ('Tennis Court 2','Tennis Court 1') AND BOOKINGS.STARTTIME >= '2012-09-21' AND BOOKINGS.STARTTIME < '2012-09-22' ORDER BY BOOKINGS.STARTTIME;",
    },
    {
      id: 15,
      query:
        'SELECT DISTINCT MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM CD.MEMBERS INNER JOIN CD.MEMBERS ON MEMBERS.MEMID = MEMBERS.RECOMMENDEDBY ORDER BY MEMBERS.SURNAME, MEMBERS.FIRSTNAME;',
    },
    {
      id: 16,
      query:
        'SELECT MEMBERS.FIRSTNAME, MEMBERS.SURNAME, MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM CD.MEMBERS LEFT OUTER JOIN CD.MEMBERS ON MEMBERS.MEMID = MEMBERS.RECOMMENDEDBY ORDER BY MEMBERS.SURNAME, MEMBERS.FIRSTNAME;',
    },
    {
      id: 17,
      query:
        "SELECT DISTINCT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE FACILITIES.NAME IN ('Tennis Court 2','Tennis Court 1') ORDER BY MEMBERS.SURNAME, FACILITIES.NAME;",
    },
    {
      id: 18,
      query:
        "SELECT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME, CASE WHEN MEMBERS.MEMID = 0 THEN BOOKINGS.SLOTS*FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS*FACILITIES.MEMBERCOST END AS COST FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE BOOKINGS.STARTTIME >= '2012-09-14' AND BOOKINGS.STARTTIME < '2012-09-15' AND ( (MEMBERS.MEMID = 0 AND BOOKINGS.SLOTS*FACILITIES.GUESTCOST > 30) OR (MEMBERS.MEMID != 0 AND BOOKINGS.SLOTS*FACILITIES.MEMBERCOST > 30) ) ORDER BY COST DESC;",
    },
    {
      id: 19,
      query:
        "SELECT DISTINCT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, (SELECT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME FROM CD.MEMBERS WHERE MEMBERS.MEMID = MEMBERS.RECOMMENDEDBY ) FROM CD.MEMBERS ORDER BY MEMBERS.SURNAME;",
    },
    //id: 20
    {
      id: 20,
      query:
        "SELECT MEMBERS.SURNAME, FACILITIES.NAME, COST FROM ( SELECT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME, CASE WHEN MEMBERS.MEMID = 0 THEN BOOKINGS.SLOTS*FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS*FACILITIES.MEMBERCOST END AS COST FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE BOOKINGS.STARTTIME >= '2012-09-14' AND BOOKINGS.STARTTIME < '2012-09-15' ) AS BOOKINGS WHERE COST > 30 ORDER BY COST DESC;",
    },
    {
      id: 21,
      query:
        "INSERT INTO CD.FACILITIES (FACID, NAME, MEMBERCOST, GUESTCOST, INITIALOUTLAY, MONTHLYMAINTENANCE) VALUES (9, 'Spa', 20, 30, 100000, 800);",
    },
    {
      id: 22,
      query:
        "INSERT INTO CD.FACILITIES (FACID, NAME, MEMBERCOST, GUESTCOST, INITIALOUTLAY, MONTHLYMAINTENANCE) VALUES (9, 'Spa', 20, 30, 100000, 800), (10, 'Squash Court 2', 3.5, 17.5, 5000, 80);",
    },
    {
      id: 23,
      query:
        "INSERT INTO CD.FACILITIES (FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE) SELECT (SELECT MAX(FACILITIES.FACID) FROM CD.FACILITIES)+1, 'Spa', 20, 30, 100000, 800;",
    },
    { id: 24, query: 'UPDATE CD.FACILITIES SET FACILITIES.INITIALOUTLAY = 10000 WHERE FACILITIES.FACID = 1;' },
    {
      id: 25,
      query:
        'UPDATE CD.FACILITIES SET FACILITIES.MEMBERCOST = 6, FACILITIES.GUESTCOST = 30 WHERE FACILITIES.FACID IN (0,1);',
    },
    {
      id: 26,
      query:
        'UPDATE CD.FACILITIES SET FACILITIES.MEMBERCOST = (SELECT FACILITIES.MEMBERCOST * 1.1 FROM CD.FACILITIES WHERE FACILITIES.FACID = 0), FACILITIES.GUESTCOST = (SELECT FACILITIES.GUESTCOST * 1.1 FROM CD.FACILITIES WHERE FACILITIES.FACID = 0) WHERE FACILITIES.FACID = 1;',
    },
    { id: 27, query: 'DELETE FROM CD.BOOKINGS;' },
    { id: 28, query: 'DELETE FROM CD.MEMBERS WHERE MEMBERS.MEMID = 37;' },
    { id: 29, query: 'DELETE FROM CD.MEMBERS WHERE MEMBERS.MEMID NOT IN (SELECT MEMBERS.MEMID FROM CD.BOOKINGS);' },
    { id: 30, query: 'SELECT COUNT(*) FROM CD.FACILITIES;' },
    { id: 31, query: 'SELECT COUNT(*) FROM CD.FACILITIES WHERE FACILITIES.GUESTCOST >= 10;' },
    {
      id: 32,
      query:
        'SELECT MEMBERS.RECOMMENDEDBY, COUNT(*) FROM CD.MEMBERS WHERE MEMBERS.RECOMMENDEDBY IS NOT NULL GROUP BY MEMBERS.RECOMMENDEDBY ORDER BY MEMBERS.RECOMMENDEDBY;',
    },
    {
      id: 33,
      query:
        'SELECT BOOKINGS.FACID, SUM(BOOKINGS.SLOTS) AS "TOTAL BOOKINGS.SLOTS" FROM CD.BOOKINGS GROUP BY BOOKINGS.FACID ORDER BY BOOKINGS.FACID;',
    },
    {
      id: 34,
      query: `SELECT BOOKINGS.FACID, SUM(BOOKINGS.SLOTS) AS "TOTAL BOOKINGS.SLOTS" FROM CD.BOOKINGS WHERE BOOKINGS.STARTTIME >= '2012-09-01' AND BOOKINGS.STARTTIME < '2012-10-01' GROUP BY BOOKINGS.FACID ORDER BY SUM(BOOKINGS.SLOTS);`,
    },
    {
      id: 35,
      query:
        'SELECT BOOKINGS.FACID, EXTRACT(MONTH FROM BOOKINGS.STARTTIME) AS MONTH, SUM(BOOKINGS.SLOTS) AS "TOTAL BOOKINGS.SLOTS" FROM CD.BOOKINGS WHERE EXTRACT(YEAR FROM BOOKINGS.STARTTIME) = 2012 GROUP BY BOOKINGS.FACID, MONTH ORDER BY BOOKINGS.FACID, MONTH;',
    },
    { id: 36, query: 'SELECT COUNT(DISTINCT BOOKINGS.MEMID) FROM CD.BOOKINGS;' },
    {
      id: 37,
      query:
        'SELECT BOOKINGS.FACID, SUM(BOOKINGS.SLOTS) AS "TOTAL BOOKINGS.SLOTS" FROM CD.BOOKINGS GROUP BY BOOKINGS.FACID HAVING SUM(BOOKINGS.SLOTS) > 1000 ORDER BY BOOKINGS.FACID;',
    },
    {
      id: 38,
      query:
        'SELECT FACILITIES.NAME, SUM(BOOKINGS.SLOTS * CASE WHEN BOOKINGS.MEMID = 0 THEN FACILITIES.GUESTCOST ELSE FACILITIES.MEMBERCOST END) AS REVENUE FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID GROUP BY FACILITIES.NAME ORDER BY REVENUE;',
    },
    {
      id: 39,
      query:
        'SELECT FACILITIES.NAME, REVENUE FROM ( SELECT FACILITIES.NAME, SUM(CASE WHEN BOOKINGS.MEMID = 0 THEN BOOKINGS.SLOTS * FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS * FACILITIES.MEMBERCOST END) AS REVENUE FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID GROUP BY FACILITIES.NAME ) AS AGG WHERE REVENUE < 1000 ORDER BY REVENUE;',
    },
    {
      id: 40,
      query:
        'SELECT BOOKINGS.FACID, SUM(BOOKINGS.SLOTS) AS "TOTAL BOOKINGS.SLOTS" FROM CD.BOOKINGS GROUP BY BOOKINGS.FACID ORDER BY SUM(BOOKINGS.SLOTS) DESC LIMIT 1;',
    },
    {
      id: 41,
      query:
        "SELECT BOOKINGS.FACID, EXTRACT(MONTH FROM BOOKINGS.STARTTIME) AS MONTH, SUM(BOOKINGS.SLOTS) AS SLOTS FROM CD.BOOKINGS WHERE BOOKINGS.STARTTIME >= '2012-01-01' AND BOOKINGS.STARTTIME < '2013-01-01' GROUP BY ROLLUP(BOOKINGS.FACID, MONTH) ORDER BY BOOKINGS.FACID, MONTH;",
    },
    {
      id: 42,
      query: `SELECT FACILITIES.FACID, FACILITIES.NAME, TRIM(TO_CHAR(SUM(BOOKINGS.SLOTS)/2.0, '9999999999999999D99')) AS "TOTAL HOURS" FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON FACILITIES.FACID = BOOKINGS.FACID GROUP BY FACILITIES.FACID, FACILITIES.NAME ORDER BY FACILITIES.FACID;`,
    },
    {
      id: 43,
      query:
        "SELECT MEMBERS.SURNAME, MEMBERS.FIRSTNAME, MEMBERS.MEMID, MIN(BOOKINGS.STARTTIME) AS STARTTIME FROM CD.BOOKINGS INNER JOIN CD.MEMBERS ON MEMBERS.MEMID = BOOKINGS.MEMID WHERE BOOKINGS.STARTTIME >= '2012-09-01' GROUP BY MEMBERS.SURNAME, MEMBERS.FIRSTNAME, MEMBERS.MEMID ORDER BY MEMBERS.MEMID;",
    },
    {
      id: 44,
      query: 'SELECT COUNT(*) OVER(), MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM CD.MEMBERS ORDER BY MEMBERS.JOINDATE;',
    },
    {
      id: 45,
      query:
        'SELECT ROW_NUMBER() OVER(ORDER BY MEMBERS.JOINDATE), MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM CD.MEMBERS ORDER BY MEMBERS.JOINDATE;',
    },
    {
      id: 46,
      query:
        'SELECT BOOKINGS.FACID, TOTAL FROM ( SELECT BOOKINGS.FACID, SUM(BOOKINGS.SLOTS) TOTAL, RANK() OVER (ORDER BY SUM(BOOKINGS.SLOTS) DESC) RANK FROM CD.BOOKINGS GROUP BY BOOKINGS.FACID ) AS RANKED WHERE RANK = 1;',
    },
    {
      id: 47,
      query:
        'SELECT MEMBERS.FIRSTNAME, MEMBERS.SURNAME, ((SUM(BOOKINGS.SLOTS)+10)/20)*10 AS HOURS, RANK() OVER (ORDER BY ((SUM(BOOKINGS.SLOTS)+10)/20)*10 DESC) AS RANK FROM CD.BOOKINGS INNER JOIN CD.MEMBERS ON BOOKINGS.MEMID = MEMBERS.MEMID GROUP BY MEMBERS.MEMID ORDER BY RANK, MEMBERS.SURNAME, MEMBERS.FIRSTNAME;',
    },
    {
      id: 48,
      query:
        'SELECT FACILITIES.NAME, RANK FROM ( SELECT FACILITIES.NAME, RANK() OVER (ORDER BY SUM(CASE WHEN BOOKINGS.MEMID = 0 THEN BOOKINGS.SLOTS * FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS * FACILITIES.MEMBERCOST END) DESC) AS RANK FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID GROUP BY FACILITIES.NAME ) AS SUBQ WHERE RANK <= 3 ORDER BY RANK;',
    },
    {
      id: 49,
      query:
        'SELECT FACILITIES.NAME, FACILITIES.INITIALOUTLAY/((SUM(CASE WHEN BOOKINGS.MEMID = 0 THEN BOOKINGS.SLOTS * FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS * FACILITIES.MEMBERCOST END)/3) - FACILITIES.MONTHLYMAINTENANCE) AS MONTHS FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID GROUP BY FACILITIES.FACID ORDER BY FACILITIES.NAME;',
    },
    {
      id: 50,
      query:
        "SELECT DATEGEN.DATE, ( SELECT SUM(CASE WHEN BOOKINGS.MEMID = 0 THEN BOOKINGS.SLOTS * FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS * FACILITIES.MEMBERCOST END) AS REV FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE BOOKINGS.STARTTIME > DATEGEN.DATE - (INTERVAL '14 days') AND BOOKINGS.STARTTIME < DATEGEN.DATE + (INTERVAL '1 day') )/15 AS REVENUE FROM ( SELECT CAST(GENERATE_SERIES(TIMESTAMP '2012-08-01', '2012-08-31','1 day') AS DATE) AS DATE ) AS DATEGEN ORDER BY DATEGEN.DATE;",
    },
    { id: 51, query: "SELECT TIMESTAMP '2012-08-31 01:00:00';" },
    { id: 52, query: "SELECT TIMESTAMP '2012-08-31 01:00:00' - TIMESTAMP '2012-07-30 01:00:00' AS INTERVAL;" },
    {
      id: 53,
      query: "SELECT GENERATE_SERIES(TIMESTAMP '2012-10-01', TIMESTAMP '2012-10-31', INTERVAL '1 day') AS TS;",
    },
    { id: 54, query: "SELECT EXTRACT(DAY FROM TIMESTAMP '2012-08-31');" },
    { id: 55, query: "SELECT EXTRACT(EPOCH FROM (TIMESTAMP '2012-09-02 00:00:00' - '2012-08-31 01:00:00'));" },
    {
      id: 56,
      query:
        "SELECT EXTRACT(MONTH FROM CAL.MONTH) AS MONTH, (CAL.MONTH + INTERVAL '1 month') - CAL.MONTH AS LENGTH FROM ( SELECT GENERATE_SERIES(TIMESTAMP '2012-01-01', TIMESTAMP '2012-12-01', INTERVAL '1 month') AS MONTH ) CAL ORDER BY MONTH;",
    },
    {
      id: 57,
      query:
        "SELECT (DATE_TRUNC('month',TS.TESTTS) + INTERVAL '1 month') - DATE_TRUNC('day', TS.TESTTS) AS REMAINING FROM (SELECT TIMESTAMP '2012-02-11 01:00:00' AS TESTTS) TS;",
    },
    {
      id: 58,
      query:
        "SELECT BOOKINGS.STARTTIME, BOOKINGS.STARTTIME + BOOKINGS.SLOTS*(INTERVAL '30 minutes') ENDTIME FROM CD.BOOKINGS ORDER BY ENDTIME DESC, BOOKINGS.STARTTIME DESC LIMIT 10;",
    },
    {
      id: 59,
      query:
        "SELECT DATE_TRUNC('month', BOOKINGS.STARTTIME) AS MONTH, COUNT(*) FROM CD.BOOKINGS GROUP BY MONTH ORDER BY MONTH;",
    },
    {
      id: 60,
      query:
        "SELECT FACILITIES.NAME, MONTH, ROUND((100*BOOKINGS.SLOTS)/ CAST( 25*(CAST((MONTH + INTERVAL '1 month') AS DATE) - CAST (MONTH AS DATE)) AS NUMERIC),1) AS UTILISATION FROM ( SELECT FACILITIES.NAME, DATE_TRUNC('month', BOOKINGS.STARTTIME) AS MONTH, SUM(BOOKINGS.SLOTS) AS SLOTS FROM CD.BOOKINGS INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID GROUP BY FACILITIES.FACID, MONTH ) AS INN ORDER BY FACILITIES.NAME, MONTH;",
    },
    { id: 61, query: "SELECT MEMBERS.SURNAME || ', ' || MEMBERS.FIRSTNAME FROM CD.MEMBERS;" },
    {
      id: 62,
      query:
        "SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES WHERE FACILITIES.NAME LIKE 'Tennis%';",
    },
    {
      id: 63,
      query:
        "SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES WHERE UPPER(FACILITIES.NAME) LIKE 'TENNIS%';",
    },
    { id: 64, query: "SELECT LPAD(CAST(MEMBERS.ZIPCODE AS CHAR(5)),5,'0') ZIP FROM CD.MEMBERS ORDER BY ZIP;" },
    {
      id: 65,
      query:
        'SELECT SUBSTR (MEMBERS.SURNAME,1,1) AS LETTER, COUNT(*) AS COUNT FROM CD.MEMBERS GROUP BY LETTER ORDER BY LETTER;',
    },
    {
      id: 66,
      query:
        "SELECT MEMBERS.MEMID, TRANSLATE(MEMBERS.TELEPHONE, '-() ', '') AS TELEPHONE FROM CD.MEMBERS ORDER BY MEMBERS.MEMID;",
    },
    {
      id: 67,
      query:
        'WITH RECURSIVE RECOMMENDERS(RECOMMENDER) AS ( SELECT MEMBERS.RECOMMENDEDBY FROM CD.MEMBERS WHERE MEMBERS.MEMID = 27 UNION ALL SELECT MEMBERS.RECOMMENDEDBY FROM RECOMMENDERS INNER JOIN CD.MEMBERS ON MEMBERS.MEMID = RECOMMENDERS.RECOMMENDER ) SELECT RECOMMENDERS.RECOMMENDER, MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM RECOMMENDERS INNER JOIN CD.MEMBERS ON RECOMMENDERS.RECOMMENDER = MEMBERS.MEMID ORDER BY MEMBERS.MEMID DESC;',
    },
    {
      id: 68,
      query:
        'WITH RECURSIVE RECOMMENDEDS(MEMBERS.MEMID) AS ( SELECT MEMBERS.MEMID FROM CD.MEMBERS WHERE MEMBERS.RECOMMENDEDBY = 1 UNION ALL SELECT MEMBERS.MEMID FROM RECOMMENDEDS INNER JOIN CD.MEMBERS ON MEMBERS.RECOMMENDEDBY = RECOMMENDEDS.MEMID ) SELECT RECOMMENDEDS.MEMID, MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM RECOMMENDEDS INNER JOIN CD.MEMBERS ON RECOMMENDEDS.MEMID = MEMBERS.MEMID ORDER BY MEMBERS.MEMID;',
    },
    {
      id: 69,
      query:
        'WITH RECURSIVE RECOMMENDERS(RECOMMENDER, MEMBER) AS ( SELECT MEMBERS.RECOMMENDEDBY, MEMBERS.MEMID FROM CD.MEMBERS UNION ALL SELECT MEMBERS.RECOMMENDEDBY, RECOMMENDERS.MEMBER FROM RECOMMENDERS INNER JOIN CD.MEMBERS ON MEMBERS.MEMID = RECOMMENDERS.RECOMMENDER ) SELECT RECOMMENDERS.MEMBER MEMBER, RECOMMENDERS.RECOMMENDER, MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM RECOMMENDERS INNER JOIN CD.MEMBERS ON RECOMMENDERS.RECOMMENDER = MEMBERS.MEMID WHERE RECOMMENDERS.MEMBER = 22 OR RECOMMENDERS.MEMBER = 12 ORDER BY RECOMMENDERS.MEMBER ASC, RECOMMENDERS.RECOMMENDER DESC;',
    },
  ];
  for (let o of response) {
    let x = goal.find((obj) => obj.id === o.id);
    if (x === undefined || x.query !== o.normalized) {
      _new.push(o);
    }
  }
  return _new;
};

const test = async (response: QueryCompare[], query: string) => {
  let newQuery = queryToUpperCase(query);
  let [code, resp] = await getTableNamesAliasesAndColumnsFromQuery(newQuery);
  console.log(newQuery, '\n');
  newQuery = replaceTableAliasesWithTableName(newQuery, resp.tac);
  console.log('replaced table aliases with table names: ');
  console.log(newQuery, '\n');
  newQuery = replaceAsterixWithTableAndColumns(newQuery, resp.tac);
  console.log('replaced asterix with table and columns: ');
  console.log(newQuery, '\n');
  newQuery = specifyColumnsWithoutTables(newQuery, resp.tac);
  console.log('specified columns without tables: ');
  console.log(newQuery, '\n');
  newQuery = removeTableAliases(newQuery, resp.tac);
  console.log('removed table aliases: ');
  console.log(newQuery, '\n');
  newQuery = removeColumnAliases(newQuery, resp.tac);
  console.log('removed columns aliases: ');
  console.log(newQuery, '\n');
  response.push({ id: 0, original: query, normalized: newQuery });
};

const testAll = async (response: QueryCompare[]): Promise<[number, Object]> => {
  let [solCode, solResult] = await getOriginalSolutions();
  // console.log('received solutions: ', solResult.solutions);
  if (solCode !== 200) return [solCode, solResult];
  for (let s of solResult.solutions) {
    // updateSolutionToUpperCase(s.id, s.original_query);
    // console.log('query: ', s.query);
    let [TACCode, TACResult] = await getTableNamesAliasesAndColumnsFromQuery(s.original_query);
    if (TACCode !== 200) return [TACCode, { message: 'Failed to obtain TAC for query: ' + s.original_query }];
    // console.log('TAC finished');
    // console.log('TACResult: query: ' + s.query, '; TAC:', TACResult.tac);
    let updated = replaceTableAliasesWithTableName(s.original_query, TACResult.tac);
    // console.log('Replaced table aliases with names');
    updated = replaceAsterixWithTableAndColumns(updated, TACResult.tac);
    // console.log('replaced asterix with tables and columns');
    updated = specifyColumnsWithoutTables(updated, TACResult.tac);
    // console.log('specified columns');
    updated = removeTableAliases(updated, TACResult.tac);
    updated = removeColumnAliases(updated, TACResult.tac);
    // response.push({ query: s.query, tac: TACResult.tac });
    response.push({ id: s.id, original: s.original_query, normalized: updated });
  }
  // console.log(result.tac);
  // console.log(solResult.solutions);
  return [200, {}];
};

export const createASTForNormalizedQuery = async (query: string): Promise<[number, CreateASTResponse]> => {
  try {
    let ast = parser.astify(query, opt);
    return [200, { message: 'OK', ast: JSON.stringify(ast)}];
  } catch (error) {
    return [500, { message: 'Failed to create AST for normalized query: ' + query, ast: '' }];
  }
}

export const normalizeQuery = async (query: string): Promise<[number, NormalizedQueryResponse]> => {
  let newQuery = queryToUpperCase(query);
  try {
    let [code, result] = await getTableNamesAliasesAndColumnsFromQuery(newQuery);
    if (code !== 200) return [code, { message: 'Failed to obtain TAC for query: ' + newQuery, normalizedQuery: '' }];
    newQuery = replaceTableAliasesWithTableName(newQuery, result.tac);
    newQuery = replaceAsterixWithTableAndColumns(newQuery, result.tac);
    newQuery = specifyColumnsWithoutTables(newQuery, result.tac);
    newQuery = removeTableAliases(newQuery, result.tac);
    newQuery = removeColumnAliases(newQuery, result.tac);
    // newQuery = sortQueryAlphabetically(newQuery);
    return [200, { message: 'OK', normalizedQuery: newQuery }];
  } catch (error) {
    return [500, { message: 'Something went wrong while trying to normalize query', normalizedQuery: '' }];
  }
};

export const updateDatabase = async (request: any, reply: any) => {
  let [solCode, solResult] = await getOriginalSolutions();
  if (solCode !== 200) {
    reply.code(solCode).send({ message: 'Failed to obtain original solutions' });
    return;
  }
  for (let s of solResult.solutions) {
    let [code, result] = await updateSolutionToUpperCase(s.id, s.original_query);
    if (code !== 200) {
      reply.code(code).send(result);
      return;
    }
    // let [normCode, normRes] = await normalizeQuery(s.original_query);
    let [normCode, normRes] = await normalizeQuery(result.query);
    if (normCode !== 200) {
      reply.code(normCode).send(normRes);
      return;
    }
    let [uNormCode, uNormRes] = await updateSolutionNormalizedQuery(s.id, normRes.normalizedQuery);
    if (uNormCode !== 200) {
      reply.code(uNormCode).send(uNormRes);
      return;
    }
    let [uASTCode, uASTRes] = await updateSolutionAST(s.id, normRes.normalizedQuery);
    if (uASTCode !== 200) {
      reply.code(uASTCode).send(uASTRes);
      return;
    }
  }
  reply.code(200).send({ message: 'Database updated successfully' });
  return;
};

export const testAST = async (request: any, reply: any) => {
  let query = 'SELECT * FROM CD.FACILITIES;';
  let [code, res] = await normalizeQuery(query);
  console.log(res);
  // let ast = parser.astify(query, opt);
  // console.dir(ast, {depth:null});
  // sortASTAlphabetically(ast);
  // console.dir(ast, { depth: null });
  reply.code(200).send({ message: 'OK' });
  return;
};

export const getAST = async (request: any, reply: any) => {
  // let { query } = request.query;
  // if (query[query.length - 1] === ';') query = query.slice(0, -1);

  // let response: queryWithTAC[] = [];
  // let response: queryCompare[] = [];
  let response = queries;
  let [code, result] = await normalizeQuery(queries[0].original);
  reply.code(code).send(result);

  // await test(response, query);
  // await test(response, "INSERT INTO CD.FACILITIES (FACID, NAME, MEMBERCOST, GUESTCOST, INITIALOUTLAY, MONTHLYMAINTENANCE) SELECT (SELECT MAX(FACID) FROM CD.FACILITIES)+1, 'Spa', 20, 30, 100000, 800;");
  // await test(response, "INSERT INTO CD.FACILITIES (FACID, NAME, MEMBERCOST, GUESTCOST, INITIALOUTLAY, MONTHLYMAINTENANCE) VALUES (9, 'Spa', 20, 30, 100000, 800);");

  // let [code, res] = await testAll(response);
  // if (code !== 200) {
  //   reply.code(code).send(res);
  //   return;
  // }
  // console.log(response);
  // response = checkResponse(response); //check v pripade ze zmenim regexy, aby sa skontrolovalo ci su query upravene spravne

  // createASTsForNormalizedQueries(response);

  // for (let o of response) {
  //   let [code, res] = await insertNormalizedQuery(o.id, o.normalized);
  //   if (code !== 200) {
  //     reply.code(code).send(res);
  //     return;
  //   }
  // }

  // for (let o of response) {
  //   let [code, res] = await updateSolutionAST(o.id, o.normalized);
  //   if (code !== 200) {
  //     reply.code(code).send(res);
  //     return;
  //   }
  // }

  // sortQueryAlphabetically("SELECT DISTINCT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE FACILITIES.NAME IN ('Tennis Court 2','Tennis Court 1') ORDER BY MEMBERS.SURNAME, FACILITIES.NAME;");
  // sortQueryAlphabetically("SELECT MEMBERS.SURNAME, FACILITIES.NAME, COST FROM ( SELECT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME, CASE WHEN MEMBERS.MEMID = 0 THEN BOOKINGS.SLOTS*FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS*FACILITIES.MEMBERCOST END AS COST FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE BOOKINGS.STARTTIME >= '2012-09-14' AND BOOKINGS.STARTTIME < '2012-09-15' ) AS BOOKINGS WHERE COST > 30 ORDER BY COST DESC;");

  // reply.code(200).send({ message: 'ok', response });
  return;
};
