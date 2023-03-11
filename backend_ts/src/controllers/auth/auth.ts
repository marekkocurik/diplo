import UserController from '../../database/userController';
import crypto from 'crypto';
import { SHA512 } from 'crypto-js';
import { pepper, jwt_secret } from '../../env-config';

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

const createToken = (role: string, id: number) => {
  const payload = {
    role: role,
    id: id,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  return jwt.sign(payload, jwt_secret);
};

export const userRegistration = async (request: any, reply: any) => {
  const { name, surname, email, password } = request.body;
  try {
    let [email_code, email_response] = await userController.emailExists(email);
    if (email_code !== 200) {
      reply.code(email_code).send(email_response);
      return;
    }
    const salt = createSalt();
    const hPassword = hashPassword(password, salt);
    let [user_code, user_response] = await userController.createNewUser(name, surname, email, hPassword, salt);
    if (user_code !== 200) {
      reply.code(user_code).send(user_response);
      return;
    }
    const user_id = user_response.id;
    let [role_code, role_response] = await userController.createNewRole('u_student');
    if (role_code !== 200) {
      reply.code(role_code).send(role_response);
      return;
    }
    const role_id = role_response.id;
    let [code, response] = await userController.assignRoleToUserByID(user_id, role_id);
    reply.code(code).send(response);
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to register new user' });
    return;
  }
};

export const userLogin = async (request: any, reply: any) => {
  const { email, password } = request.body;
  try {
    let [cred_code, cred_response] = await userController.getUserCredentialsByEmail(email);
    if (cred_code !== 200) {
      reply.code(cred_code).send(cred_response);
      return;
    }
    const dbID = cred_response.id;
    const dbPassword = cred_response.password;
    const dbSalt = cred_response.salt;
    const hashedPassword = hashPassword(password, dbSalt);
    if (hashedPassword !== dbPassword) {
      reply.code(400).send({
        message: 'Wrong password.',
      });
      return;
    }
    let [role_code, role_response] = await userController.getUserRoleByID(dbID);
    if (role_code !== 200) {
      reply.code(role_code).send(role_response);
      return;
    }
    let [update_code, update_response] = await userController.updateLastLoginByID(dbID);
    if (update_code !== 200) {
      reply.code(update_code).send(update_response);
      return;
    }
    let token = createToken(role_response.role, dbID);
    let response = {
      message: 'OK',
      token: token,
    };
    reply.code(200).send(response);
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to login user' });
    return;
  }
};

export const changeUserPassword = async (request: any, reply: any) => {
  const { currentPassword, newPassword } = request.body;
  const { id } = request.query;
  try {
    let [cred_code, cred_response] = await userController.getUserCredentialsByID(id);
    if (cred_code !== 200) {
      reply.code(cred_code).send(cred_response);
      return;
    }
    const dbPassword = cred_response.password;
    const dbSalt = cred_response.salt;
    const hashedPassword = hashPassword(currentPassword, dbSalt);
    if (hashedPassword !== dbPassword) {
      reply.code(400).send({
        message: 'Wrong password.',
      });
      return;
    }
    const newHashedPassword = hashPassword(newPassword, dbSalt);
    let [pass_code, pass_response] = await userController.changeUserPasswordByID(id, newHashedPassword);
    reply.code(pass_code).send(pass_response);
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to change user password' });
    return;
  }
};
