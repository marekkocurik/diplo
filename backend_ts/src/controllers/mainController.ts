import DatabaseController from '../database/databaseController';
import ExerciseController from '../database/exerciseController';
import UserController from '../database/userController';
import crypto from 'crypto';
import { SHA512 } from 'crypto-js';
import pepper from '../../env-config';

const dbController = new DatabaseController();
const exerciseController = new ExerciseController();
const userController = new UserController();

const createSalt = () => {
  return crypto.randomBytes(16).toString('hex');
}

const hashPassword = (password: string, salt: string) => {
  let hash = SHA512(password).toString();
  hash = SHA512(hash+salt).toString();
  return SHA512(hash+pepper).toString();
}

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

  public async registerNewUser(
    name: string,
    surname: string,
    email: string,
    password: string
  ):Promise<[Number, Object]> {
    let [code, response] = await userController.emailExists(email);
    if (code !== 200) return [code, response];
    
    let salt = createSalt();
    let hPassword = hashPassword(password, salt);
    
    [code, response] = await userController.createNewUser(name, surname, email, hPassword, salt);

    return [code, response];
  }
}
