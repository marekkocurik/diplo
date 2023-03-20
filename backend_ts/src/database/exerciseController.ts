import DatabaseController from './databaseController';

interface GeneralResponse {
  message: string;
}

interface QueryResult extends GeneralResponse {
  queryResult: object;
  executionTime: number;
}

interface ExerciseSolved extends GeneralResponse {
  user_exercises_solved: {
    id: number;
    status: boolean;
  }[];
}

interface ExerciseStarted extends GeneralResponse {
  user_exercises_started: {
    id: number;
    status: boolean;
  }[];
}

interface Exercise extends GeneralResponse {
  _id: number;
  id: number;
  name: string;
  question: string;
  solved: boolean;
  started: boolean;
}

interface Solution extends GeneralResponse {
  id: number;
  query: string;
}

interface Solutions extends GeneralResponse {
  solutions: Solution[];
}

interface Answers extends GeneralResponse {
  answers: {
    query: string;
    solution_success: string;
    submit_attempt: boolean;
    similarity: number;
    date: Date;
  }[];
}

interface Exercises extends GeneralResponse {
  exercises: Exercise[];
}

interface Chapter extends GeneralResponse {
  _id: number;
  id: number;
  name: string;
  solved: boolean;
  exercises: Exercise[];
}

interface Chapters extends GeneralResponse {
  chapters: Chapter[];
}

export default class ExerciseController extends DatabaseController {
  public async getExerciseByID(exercise_id: number): Promise<[number, Exercise]> {
    const client = await this.pool.connect();
    if (client === undefined)
      return [
        500,
        {
          message: 'Error accessing database.',
          _id: -1,
          id: -1,
          name: '',
          question: '',
          solved: false,
          started: false,
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
            _id: -1,
            id: -1,
            name: '',
            question: '',
            solved: false,
            started: false,
          },
        ];
      let response = {
        message: 'OK',
        _id: -1,
        id: result.rows[0].id,
        name: result.rows[0].name,
        question: result.rows[0].question,
        solved: false,
        started: false,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getExerciseSolutionByExerciseID(exercise_id: number): Promise<[number, Solution]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', query: '', id: -1 }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT S.id, S.query FROM users.solutions S WHERE S.exercise_id = $1 LIMIT 1;';
      let result = await client.query(query, [exercise_id]);
      if (result.rows[0] === undefined) return [500, { message: 'Failed to obtain exercise solution', query: '', id: -1 }];
      let response = {
        message: 'OK',
        id: result.rows[0].id,
        query: result.rows[0].query,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getAllExerciseSolutionsByExerciseID(exercise_id: number): Promise<[number, Solutions]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', solutions: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT S.query FROM users.solutions S WHERE S.exercise_id = $1;';
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

  public async getUserExerciseSolutionsByExerciseID(
    user_id: number,
    exercise_id: number
  ): Promise<[number, Solutions]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', solutions: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        "SELECT A.id, A.query FROM users.answers as A WHERE A.exercise_id = $1 AND A.user_id = $2 AND A.solution_success = 'COMPLETE' ORDER BY A.id DESC;";
      let result = await client.query(query, [exercise_id, user_id]);
      if (result.rows === undefined)
        return [500, { message: "Failed to obtain user's exercise solutions", solutions: [] }];
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
  ): Promise<[number, Answers]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', answers: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT A.id, A.query, A.solution_success, A.submit_attempt, A.similarity, A.date FROM users.answers A ' +
        'JOIN users.exercises E ON E.id = A.exercise_id ' +
        'JOIN users.users U ON U.id = A.user_id ' +
        'WHERE A.exercise_id = $1 AND A.user_id = $2 ' +
        'ORDER BY A.id DESC;';
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

  public async getExerciseChapters(): Promise<[number, Chapters]> {
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

  public async getChapterExercisesByChapterID(chapter_id: number): Promise<[number, Exercises]> {
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

  public async getQueryResult(role: string, query: string): Promise<[number, QueryResult]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', queryResult: {}, executionTime: 0 }];
    try {
      let setRole = `SET ROLE ${role}`;
      await client.query(setRole);
      if (query === undefined || query.trim().length === 0)
        return [403, { message: 'Empty query', queryResult: {}, executionTime: 0 }];
      await client.query('BEGIN;');
      const exec_start = process.hrtime();
      let result = await client.query(query);
      const exec_end = process.hrtime(exec_start);
      const exec_time = exec_end[0] * 1000 + exec_end[1] / 1000000;
      await client.query('ROLLBACK;');
      let response = {
        message: 'OK',
        queryResult: result.rows,
        executionTime: exec_time,
      };
      return [200, response];
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
    submit_attempt: boolean,
    execution_time: number
  ): Promise<[number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert =
        'INSERT INTO users.answers(user_id, exercise_id, query, solution_success, submit_attempt, execution_time, date) ' +
        "VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP + INTERVAL '1 hour');";
      let result = await client.query(insert, [
        user_id,
        exercise_id,
        query,
        solution_success,
        submit_attempt,
        execution_time,
      ]);
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

  public async insertNewSolution(
    exercise_id: number,
    query: string,
    execution_time: number
  ): Promise<[number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert = 'INSERT INTO users.solutions(exercise_id, query, execution_time) ' + 'VALUES ($1, $2, $3);';
      let result = await client.query(insert, [exercise_id, query, execution_time]);
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

  public async checkSolvedExercisesById(user_id: number, exercise_ids: number[]): Promise<[number, ExerciseSolved]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', user_exercises_solved: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let ex_ids = exercise_ids.join(',');
      let query =
        'SELECT id, ' +
        'CASE WHEN id IN ( ' +
        'SELECT exercise_id FROM users.answers ' +
        "WHERE user_id = $1 AND solution_success = 'COMPLETE' " +
        ') THEN true ELSE false END AS status ' +
        'FROM users.exercises WHERE id IN (' +
        ex_ids +
        ');';
      let result = await client.query(query, [user_id]);
      if (result.rows[0] === undefined) {
        return [500, { message: 'Failed to check if user has already solved the exercise', user_exercises_solved: [] }];
      }
      let response = {
        message: 'OK',
        user_exercises_solved: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async checkStartedExercisesById(user_id: number, exercise_ids: number[]): Promise<[number, ExerciseStarted]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', user_exercises_started: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let ex_ids = exercise_ids.join(',');
      let query =
        'SELECT id, ' +
        'CASE WHEN id IN ( ' +
        'SELECT exercise_id FROM users.answers ' +
        'WHERE user_id = $1 ' +
        ') THEN true ELSE false END AS status ' +
        'FROM users.exercises WHERE id IN (' +
        ex_ids +
        ');';
      let result = await client.query(query, [user_id]);
      if (result.rows[0] === undefined) {
        return [
          500,
          { message: 'Failed to check if user has already started solving the exercise', user_exercises_started: [] },
        ];
      }
      let response = {
        message: 'OK',
        user_exercises_started: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }
}
