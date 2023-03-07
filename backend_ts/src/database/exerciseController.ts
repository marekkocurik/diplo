import DatabaseController from './databaseController';

export default class ExerciseController extends DatabaseController {
  public async getExercise(exerciseId: number): Promise<[Number, Object]> {
    // TODO: k ulohu doplnit aj historiu a vratit to na FE. FE potom rovno "vykresli" posledne testovane
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      await client.query('SET ROLE u_executioner;');

      let query =
        'SELECT E.id, E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
      let result = await client.query(query, [exerciseId]);

      if (result.rows[0] === undefined)
        return [500, { message: 'Error acquiring exercise from database.' }];

      query =
        'SELECT S.query FROM users.solutions S JOIN users.exercises E ON E.id = S.exercise_id WHERE S.exercise_id=$1 LIMIT 1;';
      let solution = await client.query(query, [exerciseId]);

      if (solution.rows[0] === undefined)
        return [500, { message: 'Error acquiring exercise from database.' }];

      result.rows[0].solution = solution.rows[0].query;
      return [200, result.rows[0]];
    } catch (e) {
      return [500, { message: 'Failed to acquire exercise' }];
    } finally {
      client.release();
    }
  }

  public async getExerciseTree(): Promise<[Number, Object]> {
    // TODO: pridat aj kontrolu uz vyriesenych uloh a na FE to farebne rozlisit
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
      query =
        'SELECT E.id, E.name FROM users.exercises E WHERE E.chapter_id=$1 ORDER BY E.exercise_order;';
      let i = 1;
      for (let x of result.rows) {
        res = await client.query(query, [x.id]);

        if (res.rows[0] === undefined)
          return [
            500,
            {
              message:
                'Error acquiring exercises from database for chapter: ' +
                x.id +
                '.',
            },
          ];

        let j = 1;
        for (let y of res.rows) y._id = j++;

        x._id = i++;
        x.exercises = res.rows;
        obj.push(x);
      }

      return [200, result.rows];
    } catch (e) {
      return [500, { message: 'Failed to acquire exercise tree' }];
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

      if (query === undefined) return [400, { message: 'Empty query' }];

      await client.query('BEGIN');
      let result = await client.query(query);
      await client.query('ROLLBACK');
      return [200, result.rows];
    } catch (e) {
      await client.query('ROLLBACK');
      if (e instanceof Error) return [400, { message: e.message }];
      return [
        400,
        { message: 'Unknown error occured while trying to execute query' },
      ];
    } finally {
      client.release();
    }
  }

  // public async insertNewAnswer(
  //   role: string,
  //   query: string,
  //   id: number
  // ): Promise<[number, object]> {
  //   const client = await this.pool.connect();

  //   if (client === undefined)
  //     return [500, { message: 'Error accessing database.' }];

  //   try {
  //     let setRole = `SET ROLE ${role}`;
  //     await client.query(setRole);

  //     if (query === undefined) return [400, { message: 'Empty query' }];

  //     await client.query('BEGIN');
  //     let result = await client.query(query);
  //     await client.query('ROLLBACK');
  //     return [200, result.rows];
  //   } catch (e) {
  //     await client.query('ROLLBACK');
  //     if (e instanceof Error) return [400, { message: e.message }];
  //     return [
  //       400,
  //       { message: 'Unknown error occured while trying to execute query' },
  //     ];
  //   } finally {
  //     client.release();
  //   }
  // }
}
