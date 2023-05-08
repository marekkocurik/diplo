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
}
