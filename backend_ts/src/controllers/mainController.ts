import DatabaseController from '../database/databaseController';
import ExerciseController from '../database/exerciseController';
import UserController from '../database/userController';
import crypto from 'crypto';
import { SHA512 } from 'crypto-js';
import { pepper, jwt_secret } from '../../env-config';
const jwt = require('jsonwebtoken');

const dbController = new DatabaseController();
const exerciseController = new ExerciseController();
const userController = new UserController();

const createSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password: string, salt: any) => {
  let hash = SHA512(password).toString();
  hash = SHA512(hash + salt).toString();
  return SHA512(hash + pepper).toString();
};

const createToken = (role: any) => {
  const payload = {
    role: role,
    exp: Math.floor(Date.now()/1000) + (60*60), // 60*60
  };
  return jwt.sign(payload, jwt_secret);
};

export default class MainController {
  constructor() {}

  public async getExercises(): Promise<[Number, Object]> {
    let [code, response] = await exerciseController.getAllChaptersWithExercises();
    return [code, response];
  }

  public async login(
    email: string,
    password: string
  ): Promise<[Number, Object]> {
    let [code, response] = await userController.getUserCredentialsByEmail(
      email
    );
    if (code !== 200) return [code, response];

    let dbID = response.id;
    let dbPassword = response.password;
    let dbSalt = response.salt;

    password = hashPassword(password, dbSalt);
    if (password !== dbPassword) return [400, { message: 'Wrong password.' }];

    let [_code, _response] = await userController.getUserRoleByID(dbID);
    if (_code !== 200) return [_code, _response];

    let token = createToken(_response.role);

    return [200, { message: 'OK', token: token }];
  }

  public async registerNewUser(
    name: string,
    surname: string,
    email: string,
    password: string
  ): Promise<[Number, Object]> {
    let [code, response] = await userController.emailExists(email);
    if (code !== 200) return [code, response];

    let salt = createSalt();
    let hPassword = hashPassword(password, salt);

    [code, response] = await userController.createNewUser(
      name,
      surname,
      email,
      hPassword,
      salt,
      'u_student'
    );

    return [code, response];
  }
}
