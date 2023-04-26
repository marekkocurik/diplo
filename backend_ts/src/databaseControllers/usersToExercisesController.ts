import DatabaseController, { GeneralResponse } from './databaseController';

export interface ExerciseStartedOrSolved {
  exercise_id: number;
}

export default class UsersToExercisesController extends DatabaseController {
  public async getIdByUserIdAndExerciseId(
    user_id: number,
    exercise_id: number
  ): Promise<[GeneralResponse, number | undefined]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, -1];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT id FROM users.users_to_exercises WHERE user_id = $1 AND exercise_id = $2;';
      let result = await client.query(query, [user_id, exercise_id]);
      if (result.rows === undefined) {
        return [
          {
            code: 500,
            message:
              'Failed to obtain users_to_exercises id for user id: ' + user_id + ' and exercise id: ' + exercise_id,
          },
          -1,
        ];
      }
      let response = {
        code: 200,
        message: 'OK',
      };
      return [response, result.rows[0]?.id];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getSolvedExercisesByUserId(user_id: number): Promise<[GeneralResponse, ExerciseStartedOrSolved[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT exercise_id FROM users.users_to_exercises WHERE user_id = $1 AND solved = true';
      let result = await client.query(query, [user_id]);
      if (result.rows === undefined) return [{ code: 500, message: 'Failed to obtain any user solved exercises' }, []];
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

  public async getStartedExercisesByUserId(user_id: number): Promise<[GeneralResponse, ExerciseStartedOrSolved[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT exercise_id FROM users.users_to_exercises WHERE user_id = $1 ';
      let result = await client.query(query, [user_id]);
      if (result.rows === undefined) return [{ code: 500, message: 'Failed to obtain any user started exercises' }, []];
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

  public async insertReturningId(user_id: number, exercise_id: number): Promise<[GeneralResponse, number]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, -1];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert = 'INSERT INTO users.users_to_exercises(user_id, exercise_id) VALUES ($1, $2) RETURNING id';
      let result = await client.query(insert, [user_id, exercise_id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [
          {
            code: 500,
            message:
              'Failed to insert new users_to_exercises for user_id: ' + user_id + ', exercise_id: ' + exercise_id,
          },
          -1,
        ];
      }
      // console.log('result inserting UTE: ', result);
      let response = {
        code: 200,
        message: 'OK',
      };
      await client.query('COMMIT;');
      return [response, result.rows[0].id];
    } catch (e) {
      await client.query('ROLLBACK;');
      throw e;
    } finally {
      client.release();
    }
  }
}
