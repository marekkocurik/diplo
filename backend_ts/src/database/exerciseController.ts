import DatabaseController from './databaseController';

export default class ExerciseController extends DatabaseController {
  public async getExercise(exerciseId: number): Promise<[Number, Object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      await client.query('SET ROLE u_executioner;');

      let query = 'SELECT E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
      let result = await client.query(query, [exerciseId]);

      if (result.rows[0] === undefined)
        return [500, { message: 'Error acquiring exercise from database.' }];

      return [200, result.rows[0]];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

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

  public async executeQuery(
    role: string,
    query: string
  ): Promise<[number, object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      // await client.query('BEGIN');
      let setRole = `SET ROLE ${role}`;
      let roleResult = await client.query(setRole);
      console.log(roleResult.rows);
      let result = await client.query(query);
      return [200, { message: result.rows }];
    } catch (e) {
      // await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
