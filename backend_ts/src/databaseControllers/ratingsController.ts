import DatabaseController, { GeneralResponse } from './databaseController';

export default class RatingsController extends DatabaseController {
  public async insertMany(insert: string): Promise<GeneralResponse> {
    const client = await this.pool.connect();
    if (client === undefined) return { code: 500, message: 'Error accessing database' };
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let result = await client.query(insert);
      if (result.rowCount < 1) {
        await client.query('ROLLBACK;');
        return { code: 500, message: 'Failed to insert many rows into users.ratings table' };
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

  public async getIdByUsersToExercisesIdAndRecommendation(
    users_to_exercises_id: number,
    recommendation: string
  ): Promise<[GeneralResponse, number]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, -1];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT id FROM users.ratings WHERE users_to_exercises_id = $1 AND recommendation = $2;';
      let result = await client.query(query, [users_to_exercises_id, recommendation]);
      if (result.rows[0] === undefined) {
        return [
          {
            code: 500,
            message: 'Failed to get id of a recommendation: ' + recommendation + ', exercise_id: ' + users_to_exercises_id,
          },
          -1,
        ];
      }
      return [{ code: 200, message: 'OK' }, result.rows[0].id];
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }

  public async updateRating(id: number, rating: number): Promise<GeneralResponse> {
    const client = await this.pool.connect();
    if (client === undefined) return { code: 500, message: 'Error accessing database' };
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let update = 'UPDATE users.solutions SET rating = $1 WHERE id = $2;';
      let result = await client.query(update, [rating, id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return { code: 500, message: 'Failed to update recommendation id: ' + id };
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

  public async updateVisited(id: number): Promise<GeneralResponse> {
    const client = await this.pool.connect();
    if (client === undefined) return { code: 500, message: 'Error accessing database' };
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let update = 'UPDATE users.ratings SET visited = true WHERE id = $1;';
      let result = await client.query(update, [id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return { code: 500, message: 'Failed to update recommendation id: ' + id };
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
