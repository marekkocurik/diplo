import DatabaseController, { GeneralResponse } from './databaseController';

interface Exercise {
  id: number;
  name: string;
  question: string;
}

export interface TreeExercise {
  _id: number;
  id: number;
  name: string;
  solved: boolean;
  started: boolean;
}

export interface ExerciseSolved {
  exercise_id: number;
}

export interface ExerciseStarted {
  exercise_id: number;
}

export default class ExerciseController extends DatabaseController {
  public async getExerciseByID(exercise_id: number): Promise<[GeneralResponse, Exercise]> {
    const client = await this.pool.connect();
    if (client === undefined)
      return [
        { code: 500, message: 'Error accessing database' },
        {
          id: -1,
          name: '',
          question: '',
        },
      ];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT E.id, E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined)
        return [
          { code: 500, message: 'Failed to obtain exercise information' },
          {
            id: -1,
            name: '',
            question: '',
          },
        ];
      let response = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        question: result.rows[0].question,
      };
      return [{ code: 200, message: 'OK' }, response];
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }

  public async getTreeExercisesByChapterID(chapter_id: number): Promise<[GeneralResponse, TreeExercise[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT E.id, E.name FROM users.exercises E WHERE E.chapter_id=$1 ORDER BY E.exercise_order;';
      let result = await client.query(query, [chapter_id]);
      if (result.rows === undefined)
        return [{ code: 500, message: 'Failed to obtain exercises for Chapter id: ' + chapter_id }, []];
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

  public async checkSolvedExercisesById(
    user_id: number
  ): Promise<[GeneralResponse, ExerciseSolved[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT exercise_id FROM users.users_to_exercises WHERE user_id = $1 AND solved = true';
      let result = await client.query(query, [user_id]);
      if (result.rows === undefined) {
        return [{ code: 500, message: 'Failed to check if user has any solved exercises' }, []];
      }
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

  public async checkStartedExercisesById(
    user_id: number
  ): Promise<[GeneralResponse, ExerciseStarted[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT exercise_id FROM users.users_to_exercises WHERE user_id = $1 ';
      let result = await client.query(query, [user_id]);
      if (result.rows === undefined) {
        return [{ code: 500, message: 'Failed to check if user has any started exercises' }, []];
      }
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
