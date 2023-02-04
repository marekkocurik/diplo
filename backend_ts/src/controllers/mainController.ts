import DatabaseController from "../database/databaseController";
import ExerciseController from "../database/exerciseController";
import UserController from "../database/userController";

const dbController = new DatabaseController();
const exerciseController = new ExerciseController();
const userController = new UserController();

export default class MainController {
  constructor() {}

  public async auth_test() {
    // const client = await this.pool.connect();
    // if (client === undefined) return console.error('Error acquiring client');
    // else {
    //   const first = 'SELECT current.user;';
    //   const result = client.query(first);
    //   return [200, { message: result.rows }];
    // }
    let query = 'SELECT current_user;';
    return await exerciseController.executeQuery('u_executioner', query);
    // return [code, response];
  }
}
