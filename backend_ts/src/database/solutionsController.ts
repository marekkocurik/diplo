import DatabaseController, { GeneralResponse } from './databaseController';

export interface Solution {
  id: number;
  original_query: string;
  normalized_query: string;
  ast: string;
}

export interface Solution_ID_OriginalQuery {
  id: number;
  original_query: string;
}

export interface Solution_ID_NormalizedQuery {
  id: number;
  normalized_query: string;
}

export default class SolutionController extends DatabaseController {
  public async getAllExerciseSolutionsByExerciseId(exercise_id: number): Promise<[GeneralResponse, Solution[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT S.id, S.original_query, S.normalized_query, S.abstract_syntax_tree as ast ' +
        'FROM users.solutions as S WHERE S.exercise_id = $1 ORDER BY S.id';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined)
        return [{ code: 500, message: 'Failed to obtain Solutions for Exercise id: ' + exercise_id }, []];
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

  public async getAllOriginalSolutionsOriginalQuery(): Promise<[GeneralResponse, Solution_ID_OriginalQuery[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT S.id, S.original_query FROM users.solutions as S WHERE S.id <= 69 ORDER BY S.id';
      let result = await client.query(query);
      if (result.rows[0] === undefined)
        return [{ code: 500, message: 'Failed to get all Solutions original_query' }, []];
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

  public async getExerciseExpectedSolutionOriginalQueryByExerciseId(
    exercise_id: number
  ): Promise<[GeneralResponse, Solution_ID_OriginalQuery[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT S.id, S.original_query FROM users.solutions as S WHERE S.exercise_id = $1 ORDER BY S.id LIMIT 1';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined)
        return [
          { code: 500, message: 'Failed to obtain Solutions original_query for Exercise id: ' + exercise_id },
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

  public async getAllExerciseSolutionsNormalizedQueryByExerciseId(
    exercise_id: number
  ): Promise<[GeneralResponse, Solution_ID_NormalizedQuery[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT S.id, S.normalized_query FROM users.solutions S WHERE S.exercise_id = $1;';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined)
        return [
          { code: 500, message: 'Failed to obtain all Solutions normalized_query for Exercise id: ' + exercise_id },
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

  public async insertNewSolution(
    exercise_id: number,
    original_query: string,
    normalized_query: string,
    abstract_syntax_tree: string
  ): Promise<GeneralResponse> {
    const client = await this.pool.connect();
    if (client === undefined) return { code: 500, message: 'Error accessing database' };
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert =
        'INSERT INTO users.solutions(exercise_id, original_query, normalized_query, abstract_syntax_tree) ' +
        'VALUES ($1, $2, $3, $4);';
      let result = await client.query(insert, [
        exercise_id,
        original_query,
        normalized_query,
        abstract_syntax_tree,
      ]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return { code: 500, message: 'Failed to insert new exercise solution' };
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
