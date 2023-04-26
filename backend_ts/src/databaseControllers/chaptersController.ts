import DatabaseController, { GeneralResponse } from './databaseController';
import { TreeExercise } from './exercisesController';

export interface TreeChapter {
  _id: number;
  id: number;
  name: string;
  solved: boolean;
  exercises: TreeExercise[];
}

export default class ChaptersController extends DatabaseController {
  public async getAllChapters(): Promise<[GeneralResponse, TreeChapter[]]> {
    const client = await this.pool.connect();
    if (client === undefined) return [{ code: 500, message: 'Error accessing database' }, []];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT C.id, C.name FROM users.chapters C ORDER BY C.chapter_order;';
      let result = await client.query(query);
      if (result.rows === undefined) return [{ code: 500, message: 'Failed to obtain chapters' }, []];
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
