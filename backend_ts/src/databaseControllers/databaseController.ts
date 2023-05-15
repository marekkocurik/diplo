const { Pool } = require('pg');

export interface GeneralResponse {
  code: number;
  message: string;
}

interface TableColumn {
  column_name: string;
}

export interface QueryResult {
  queryResult: object;
  executionTime: number;
}

export interface LeaderboardAttemptItem {
  c_id: number;
  c_name: string;
  e_id: number;
  e_name: string;
  username: string;
  attempts: number;
}

export interface LeaderboardExecTimeItem {
  c_id: number;
  c_name: string;
  e_id: number;
  e_name: string;
  username: string;
  execution_time: number;
}

export default class DatabaseController {
  constructor() {}
  public pool = new Pool();

  public async getAllTableColumns(schema_name: string, table_name: string): Promise<[GeneralResponse, TableColumn[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2';
      let result = await client.query(query, [schema_name, table_name]);
      if (result.rows === undefined)
        return [
          {
            code: 500,
            message: 'Failed to get table columns for table: ' + table_name + ', in schema: ' + schema_name,
          },
          [],
        ];
      let response = {
        code: 200,
        message: 'OK',
      };
      return [response, result.rows];
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }

  public async getQueryResult(role: string, query: string): Promise<[GeneralResponse, QueryResult]> {
    const client = await this.pool.connect();
    if (client === undefined)
      return [
        { code: 500, message: 'Error accessing database' },
        { queryResult: {}, executionTime: 0 },
      ];
    try {
      let setRole = `SET ROLE ${role}`;
      await client.query(setRole);
      if (query === undefined || query.trim().length === 0)
        return [
          { code: 403, message: 'Empty query' },
          { queryResult: {}, executionTime: 0 },
        ];
      await client.query('BEGIN;');
      const exec_start = process.hrtime();
      let result = await client.query(query);
      const exec_end = process.hrtime(exec_start);
      const exec_time = exec_end[0] * 1000 + exec_end[1] / 1000000;
      await client.query('ROLLBACK;');
      let response = {
        code: 200,
        message: 'OK',
      };
      let qRes = {
        queryResult: result.rows,
        executionTime: exec_time,
      };
      return [response, qRes];
    } catch (e) {
      await client.query('ROLLBACK;');
      throw e;
    } finally {
      client.release();
    }
  }

  public async getNonSelectQueryResult(
    role: string,
    query: string,
    table: string
  ): Promise<[GeneralResponse, { queryResult: object }]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, { queryResult: [] }];
    try {
      let setRole = `SET ROLE ${role}`;
      await client.query(setRole);
      await client.query('BEGIN;');
      let result = await client.query(query);
      let select = 'SELECT * FROM cd.' + table + ';';
      result = await client.query(select);
      await client.query('ROLLBACK;');
      return [{ code: 200, message: 'OK' }, { queryResult: result.rows }];
    } catch (e) {
      await client.query('ROLLBACK;');
      throw e;
    } finally {
      client.release();
    }
  }

  public async getOverallLeaderboardAttempts(): Promise<[GeneralResponse, LeaderboardAttemptItem[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        "SELECT sub.c_id, sub.c_name, sub.e_id, sub.e_name, u.name || ' ' || u.surname as username, attempts " +
        'FROM ( ' +
        'SELECT qa.c_id, qa.c_name, qa.e_id, qa.e_name, qb.u_id, qb.attempts ' +
        'FROM ( ' +
        '  SELECT c.id AS c_id, c.name AS c_name, ' +
        '         ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY e.exercise_order) AS e_id, e.id as e_r_id, ' +
        '         e.name AS e_name ' +
        '  FROM users.chapters c ' +
        '  JOIN users.exercises e ON e.chapter_id = c.id ' +
        ') qa ' +
        'JOIN ( ' +
        '  SELECT ute.user_id AS u_id, ute.exercise_id AS e_id, ute.id AS ute_id, ' +
        '         (SELECT COUNT(*) ' +
        '          FROM users.answers a2 ' +
        '          WHERE a2.users_to_exercises_id = ute.id ' +
        '            AND a2.submit_attempt = true ' +
        '            AND a2.id <= MIN(a.id)) AS attempts ' +
        '  FROM users.answers a ' +
        '  JOIN users.users_to_exercises ute ON ute.id = a.users_to_exercises_id ' +
        "  WHERE a.solution_success = 'COMPLETE' " +
        '  GROUP BY u_id, e_id, ute_id ' +
        ') qb ' +
        'ON qa.e_r_id = qb.e_id ' +
        'ORDER BY qa.c_id, qa.e_id, qb.u_id ' +
        ') sub ' +
        'JOIN users.users u on u.id = sub.u_id ' +
        'ORDER BY c_id, e_id, attempts, username;';
      let result = await client.query(query);
      if (result.rows === undefined) return [{ code: 500, message: 'Failed to get overall leadeboard - attempts' }, []];
      let response = {
        code: 200,
        message: 'OK',
      };
      return [response, result.rows];
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }

  public async getOverallLeaderboardExecTime(): Promise<[GeneralResponse, LeaderboardExecTimeItem[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        "SELECT qa.c_id, qa.c_name, qa.e_id, qa.e_name, u.name || ' ' || u.surname AS username, qb.execution_time   " +
        'FROM (   ' +
        '  SELECT c.id AS c_id, c.name AS c_name,   ' +
        '		 ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY e.exercise_order) AS e_id, e.id AS e_r_id,   ' +
        '		 e.name AS e_name   ' +
        '  FROM users.chapters c   ' +
        '  JOIN users.exercises e ON e.chapter_id = c.id ' +
        ') qa   ' +
        'JOIN (   ' +
        '	SELECT ute.exercise_id AS e_id, ute.user_id AS u_id, MIN(a.execution_time) AS execution_time, ' +
        '		ROW_NUMBER() OVER (PARTITION BY ute.exercise_id ORDER BY MIN(a.execution_time)) AS row_num ' +
        '	FROM users.users_to_exercises ute   ' +
        '	JOIN users.answers a ON ute.id = a.users_to_exercises_id   ' +
        "	WHERE ute.solved = true AND a.solution_success = 'COMPLETE' " +
        '	GROUP BY ute.exercise_id, ute.user_id ' +
        ') qb   ' +
        'ON qa.e_r_id = qb.e_id ' +
        'JOIN users.users AS u ON u.id = qb.u_id ' +
        'WHERE qb.row_num <= 10 ' +
        'ORDER BY qa.c_id, qa.e_id, qb.execution_time;';
      let result = await client.query(query);
      if (result.rows === undefined) return [{ code: 500, message: 'Failed to get overall leadeboard - execTime' }, []];
      let response = {
        code: 200,
        message: 'OK',
      };
      return [response, result.rows];
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }
}
