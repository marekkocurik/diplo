import DatabaseController from './databaseController';

export default class ExerciseController extends DatabaseController {
  public async getExercise(exerciseId: number): Promise<[Number, Object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      await client.query('SET ROLE u_executioner;');

      let query = 'SELECT E.id, E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
      let result = await client.query(query, [exerciseId]);

      if (result.rows[0] === undefined)
        return [500, { message: 'Error acquiring exercise from database.' }];

      query = 'SELECT S.query FROM users.solutions S JOIN users.exercises E ON E.id = S.exercise_id WHERE S.exercise_id=$1 LIMIT 1;'
      let solution = await client.query(query, [exerciseId]);

      if (solution.rows[0] === undefined)
        return [500, { message: 'Error acquiring exercise from database.' }];

      result.rows[0].solution = solution.rows[0].query;
      console.log('returning exercise like: ')
      console.log(result.rows[0]);
      return [200, result.rows[0]];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }


  // public async getExpectedResult(
  //   exerciseId: number
  // ): Promise<[number, object]> {
  //   const client = await this.pool.connect();

  //   if (client === undefined)
  //     return [500, { message: 'Error accessing database.' }];

  //   try {
  //     await client.query('SET ROLE u_executioner;');
  //     let solutionResult = "SELECT S.query FROM users.solutions AS S JOIN users.exercises as E ON E.id = S.exercise_id WHERE S.exercise_id=$1"
  //     let solution = await client.query(solutionResult, [exerciseId]);
  //     // console.log(solution.rows[0].query);
  //     let result = await client.query(solution.rows[0].query);
  //     // console.log(result.rows)
  //     return [200, result.rows];
  //   } catch (e) {
  //     // await client.query('ROLLBACK');
  //     return [500, { message: "Error occured while trying to access expected result" }];
  //   } finally {
  //     client.release();
  //   }
  // }

  

  public async getExerciseTree(): Promise<[Number, Object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      const obj: object[] = [];
      await client.query('SET ROLE u_executioner;');

      let query =
        'SELECT C.id, C.name FROM users.chapters C ORDER BY C.chapter_order;';
      let result = await client.query(query);

      if (result.rows[0] === undefined)
        return [500, { message: 'Error acquiring chapters from database.' }];

      let res;
      query = 'SELECT E.id, E.name FROM users.exercises E WHERE E.chapter_id=$1 ORDER BY E.exercise_order;';
      let i = 1;
      for (let x of result.rows) {
        res = await client.query(query, [x.id]);

        if (res.rows[0] === undefined)
          return [500, { message: 'Error acquiring exercises from database for chapter: '+x.id+'.' }];

        let j = 1;
        for (let y of res.rows)
          y._id = j++;

        x._id = i++;
        x.exercises = res.rows;
        obj.push(x);
      }

      return [200, result.rows];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getQueryResult(
    role: string,
    query: string
  ): Promise<[number, object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      let setRole = `SET ROLE ${role}`;
      await client.query(setRole);
      await client.query('BEGIN');
      let result = await client.query(query);
      await client.query('ROLLBACK');
      return [200, result.rows];
    } catch (e) {
      if (e instanceof Error) return [400, { message: e.message}];
      return [400, { message: "Unknown error occured while trying to execute query" }];
    } finally {
      client.release();
    }
  }

  // public async executeQuery(
  //   role: string,
  //   query: string
  // ): Promise<[number, object]> {
  //   const client = await this.pool.connect();

  //   if (client === undefined)
  //     return [500, { message: 'Error accessing database.' }];

  //   try {
  //     // await client.query('BEGIN');
  //     let setRole = `SET ROLE ${role}`;
  //     let roleResult = await client.query(setRole);
  //     console.log(roleResult.rows);
  //     let result = await client.query(query);
  //     return [200, { message: result.rows }];
  //   } catch (e) {
  //     // await client.query('ROLLBACK');
  //     throw e;
  //   } finally {
  //     client.release();
  //   }
  // }
}
