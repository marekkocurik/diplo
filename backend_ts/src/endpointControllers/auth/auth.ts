import UserController, { User_ID_Password_Salt, User_Password_Salt } from '../../databaseControllers/userController';
import crypto from 'crypto';
import { SHA512 } from 'crypto-js';
import { pepper, jwt_secret } from '../../env-config';
import { GeneralResponse } from '../../databaseControllers/databaseController';

const jwt = require('jsonwebtoken');
const userController = new UserController();

const createSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password: string, salt: string) => {
  let hash = SHA512(password).toString();
  hash = SHA512(hash + salt).toString();
  return SHA512(hash + pepper).toString();
};

const createToken = (role: string, id: number, cluster: number) => {
  const payload = {
    role: role,
    id: id,
    cluster: cluster,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  return jwt.sign(payload, jwt_secret);
};

type UserRegistrationResponse = [GeneralResponse, boolean] | [GeneralResponse, number] | GeneralResponse;
type UserLoginResponse = [GeneralResponse, User_ID_Password_Salt] | [GeneralResponse, string] | [GeneralResponse, number] | GeneralResponse;
type ChangePasswordResponse = [GeneralResponse, User_Password_Salt] | GeneralResponse;

export const userRegistration = async (request: any, reply: any) => {
  const { name, surname, email, password } = request.body;
  try {
    let response: UserRegistrationResponse;
    response = await userController.userEmailExists(email);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const salt = createSalt();
    const hPassword = hashPassword(password, salt);
    response = await userController.insertNewUserReturningId(name, surname, email, hPassword, salt);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const user_id = response[1] as number;
    response = await userController.insertNewRoleReturningId('u_student');
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const role_id = response[1] as number;
    response = await userController.insertNewUsersToRolesByUserIdAndRoleId(user_id, role_id);
    reply.code(response.code).send({ message: response.message });
    return;
  } catch (error) {
    reply.code(500).send({ message: 'Unknown error occured while trying to register new user' });
    return;
  }
};

export const userLogin = async (request: any, reply: any) => {
  const { email, password } = request.body;
  try {
    let response: UserLoginResponse;
    response = await userController.getUserCredentialsByEmail(email);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const user_id = response[1].id;
    const dbPassword = response[1].password;
    const dbSalt = response[1].salt;
    const hashedPassword = hashPassword(password, dbSalt);
    if (hashedPassword !== dbPassword) {
      reply.code(400).send({
        message: 'Wrong password.',
      });
      return;
    }
    response = await userController.getUserRoleById(user_id);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const role = response[1] as string;
    response = await userController.updateLastLoginById(user_id);
    if (response.code !== 200) {
      reply.code(response.code).send({ message: response.message });
      return;
    }
    response = await userController.getUserClusterById(user_id);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const cluster = response[1] as number;
    let token = createToken(role, user_id, cluster);
    reply.code(200).send({ message: response[0].message, token: token });
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to login user' });
    return;
  }
};

export const changeUserPassword = async (request: any, reply: any) => {
  const { currentPassword, newPassword } = request.body;
  const user_id = request.query.id;
  try {
    let response: ChangePasswordResponse;
    response = await userController.getUserCredentialsByID(user_id);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const dbPassword = response[1].password;
    const dbSalt = response[1].salt;
    const hashedPassword = hashPassword(currentPassword, dbSalt);
    if (hashedPassword !== dbPassword) {
      reply.code(400).send({
        message: 'Wrong password.',
      });
      return;
    }
    const newHashedPassword = hashPassword(newPassword, dbSalt);
    response = await userController.changeUserPasswordById(user_id, newHashedPassword);
    reply.code(response.code).send({ message: response.message });
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to change user password' });
    return;
  }
};

export const getUsername = async (request: any, reply: any) => {
  const user_id = request.query.id;
  try {
    let response = await userController.getUserNameAndSurname(user_id);
    reply
      .code(response[0].code)
      .send({ message: response[0].message, username: response[1].name + ' ' + response[1].surname });
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to obtain Username' });
    return;
  }
};
