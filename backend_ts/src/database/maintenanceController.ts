const { Pool } = require('pg');
import { pghost, pgdatabase, pguser_admin, pgpassword_admin, pgport } from '../env-config';
import { GeneralResponse } from './databaseController';
import { Solution_ID_OriginalQuery } from './solutionsController';

export default class MaintenanceController {
  constructor() {}

  private admin_pool = new Pool({
    host: pghost,
    database: pgdatabase,
    user: pguser_admin,
    password: pgpassword_admin,
    port: pgport,
  });

  public async getAllSolutionsOriginalQuery(): Promise<[GeneralResponse, Solution_ID_OriginalQuery[]]> {
    const client = await this.admin_pool.connect();
    if (client === undefined) return [{ code: 500, message: 'ADMIN: Error accessing database' }, []];
    try {
      let query = 'SELECT S.id, S.original_query FROM users.solutions as S WHERE S.id <= 69 ORDER BY S.id';
      let result = await client.query(query);
      if (result.rows[0] === undefined)
        return [{ code: 500, message: 'ADMIN: Failed to get all Solutions original_query' }, []];
      let genResp = { code: 200, message: 'OK' };
      let solutions = result.rows;
      return [genResp, solutions];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  public async updateSolutionOriginalQueryToUpperCaseById(
    solution_id: number,
    original_query: string
  ): Promise<GeneralResponse> {
    const client = await this.admin_pool.connect();
    if (client === undefined) return { code: 500, message: 'ADMIN: Error accessing database' };
    try {
      await client.query('BEGIN;');
      let update = 'UPDATE users.solutions SET original_query = $1 WHERE id = $2';
      let result = await client.query(update, [original_query, solution_id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return {
          code: 500,
          message: 'ADMIN: Failed to update original_query to uppercase in Solution id: ' + solution_id,
        };
      }
      await client.query('COMMIT;');
      return { code: 200, message: 'OK' };
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
  }

  public async updateSolutionNormalizedQueryById(
    solution_id: number,
    normalized_query: string
  ): Promise<GeneralResponse> {
    const client = await this.admin_pool.connect();
    if (client === undefined) return { code: 500, message: 'ADMIN: Error accessing database' };
    try {
      await client.query('BEGIN;');
      let update = 'UPDATE users.solutions SET normalized_query = $1 WHERE id = $2';
      let result = await client.query(update, [normalized_query, solution_id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return { code: 500, message: 'ADMIN: Failed to update normalized_query for Solution id: ' + solution_id };
      }
      await client.query('COMMIT;');
      return { code: 200, message: 'OK' };
    } catch (e) {
      await client.query('ROLLBACK;');
      throw e;
    } finally {
      client.release();
    }
  }

  public async updateSolutionASTById(solution_id: number, abstract_syntax_tree: string): Promise<GeneralResponse> {
    const client = await this.admin_pool.connect();
    if (client === undefined) return { code: 500, message: 'ADMIN: Error accessing database' };
    try {
      await client.query('BEGIN;');
      let update = 'UPDATE users.solutions SET abstract_syntax_tree = $1 WHERE id = $2';
      let result = await client.query(update, [abstract_syntax_tree, solution_id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return { code: 500, message: 'ADMIN: Failed to update AST for Solution id: ' + solution_id };
      }
      await client.query('COMMIT;');
      return { code: 200, message: 'OK' };
    } catch (e) {
      await client.query('ROLLBACK;');
      throw e;
    } finally {
      client.release();
    }
  }
}
