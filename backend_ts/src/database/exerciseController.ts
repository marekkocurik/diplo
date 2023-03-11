import DatabaseController from './databaseController';

interface GeneralResponse {
  message: string;
}

interface Exercise extends GeneralResponse {
  id: number;
  name: string;
  question: string;
  schema: string;
}

interface Solution extends GeneralResponse {
  solution: string;
}

interface Solutions extends GeneralResponse {
  solutions: {
    query: {}
  }[]
}

interface Answers extends GeneralResponse {
  answers: {
    query: string;
    solution_success: string;
    similarity: number;
  }[];
}

interface Chapters extends GeneralResponse {
  chapters: {
    _id: number;
    id: number;
    name: string;
    exercises: {
      _id: number;
      id: number;
      name: string;
    }[];
  }[];
}

interface Chapter extends GeneralResponse {
  exercises: {
    _id: number;
    id: number;
    name: string;
  }[];
}

export default class ExerciseController extends DatabaseController {
  public async getExerciseByID(exercise_id: number): Promise<[Number, Exercise]> {
    const client = await this.pool.connect();
    if (client === undefined)
      return [
        500,
        {
          message: 'Error accessing database.',
          id: -1,
          name: '',
          question: '',
          schema: '',
        },
      ];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT E.id, E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined)
        return [
          500,
          {
            message: 'Failed to obtain exercise information',
            id: -1,
            name: '',
            question: '',
            schema: '',
          },
        ];
      let response = {
        message: 'OK',
        id: result.rows[0].id,
        name: result.rows[0].name,
        question: result.rows[0].question,
        schema: result.rows[0].schema,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getExerciseSolutionByExerciseID(exercise_id: number): Promise<[Number, Solution]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', solution: '' }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT S.query FROM users.solutions S WHERE S.exercise_id = $1 LIMIT 1;';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined) return [500, { message: 'Failed to obtain exercise solution', solution: '' }];
      let response = {
        message: 'OK',
        solution: result.rows[0].query,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getExerciseSolutionsByExerciseID(exercise_id: number): Promise<[Number, Solutions]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', solutions: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT S.query FROM users.solutions S WHERE S.exercise_id = $1;';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined) return [500, { message: 'Failed to obtain exercise solutions', solutions: [] }];
      let response = {
        message: 'OK',
        solutions: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getExerciseAnswersByExerciseIDAndUserID(
    exercise_id: number,
    user_id: number
  ): Promise<[Number, Answers]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', answers: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT A.query, A.solution_success, A.submit_attempt, A.similarity FROM users.answers A ' +
        'JOIN users.exercises E ON E.id = A.exercise_id ' +
        'JOIN users.users U ON U.id = A.user_id ' +
        'WHERE A.exercise_id = $1 AND A.user_id = $2;';
      let result = await client.query(query, [exercise_id, user_id]);
      if (result.rows === undefined) return [500, { message: "Failed to obtain user's exercise answers", answers: [] }];
      let response = {
        message: 'OK',
        answers: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getExerciseChapters(): Promise<[Number, Chapters]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', chapters: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT C.id, C.name FROM users.chapters C ORDER BY C.chapter_order;';
      let result = await client.query(query);
      if (result.rows === undefined)
        return [500, { message: 'Failed to obtain chapters from database.', chapters: [] }];
      let response = {
        message: 'OK',
        chapters: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getChapterExercisesByChapterID(chapter_id: number): Promise<[Number, Chapter]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', exercises: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT E.id, E.name FROM users.exercises E WHERE E.chapter_id=$1 ORDER BY E.exercise_order;';
      let result = await client.query(query, [chapter_id]);
      if (result.rows === undefined) return [500, { message: "Failed to obtain chapter's exercises", exercises: [] }];
      let response = {
        message: 'OK',
        exercises: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getQueryResult(role: string, query: string): Promise<[Number, Object]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      let setRole = `SET ROLE ${role}`;
      await client.query(setRole);
      if (query === undefined || query.trim().length === 0) return [400, { message: 'Empty query' }];
      await client.query('BEGIN;');
      let result = await client.query(query);
      await client.query('ROLLBACK;');
      return [200, result.rows];
    } catch (e) {
      await client.query('ROLLBACK;');
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async insertNewAnswer(
    user_id: number,
    exercise_id: number,
    query: string,
    solution_success: string,
    submit_attempt: boolean
  ): Promise<[Number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert = "INSERT INTO users.answers(user_id, exercise_id, query, solution_success, submit_attempt, date) " +
                   "VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '1 hour');";
      let result = await client.query(insert, [user_id, exercise_id, query, solution_success, submit_attempt]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [500, { message: "Failed to insert new record into user's exercise history" }];
      }
      await client.query('COMMIT;');
      return [200, { message: 'OK' }];
    } catch (e) {
      await client.query('ROLLBACK;');
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async insertNewSolution(user_id: number, exercise_id: number, query: string): Promise<[Number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert = 'INSERT INTO users.solutions(exercise_id, query) ' +
                   'VALUES ($1, $2);';
      let result = await client.query(insert, [exercise_id, query]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [500, { message: 'Failed to insert new exercise solution' }];
      }
      await client.query('COMMIT;');
      return [200, { message: 'OK' }];
    } catch (e) {
      await client.query('ROLLBACK;');
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }
}
