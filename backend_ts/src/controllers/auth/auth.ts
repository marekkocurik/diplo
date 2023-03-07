import UserController from '../../database/userController';
import crypto from 'crypto';
import { SHA512 } from 'crypto-js';
import { pepper, jwt_secret } from '../../env-config';

const jwt = require('jsonwebtoken');
const userController = new UserController();

const createSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password: string, salt: any) => {
  let hash = SHA512(password).toString();
  hash = SHA512(hash + salt).toString();
  return SHA512(hash + pepper).toString();
};

const createToken = (role: any, id: any) => {
  const payload = {
    role: role,
    id: id,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  return jwt.sign(payload, jwt_secret);
};

export const userLogin = async (request: any, reply: any) => {
  const { email, password } = request.body;
  console.log('Attempting to login ... ');
  let [code, response] = await userController.getUserCredentialsByEmail(email);

  if (code !== 200) {
    reply.code(code).send(response);
    return;
  }

  const dbID = response.id;
  const dbPassword = response.password;
  const dbSalt = response.salt;

  const hashedPassword = hashPassword(password, dbSalt);
  if (hashedPassword !== dbPassword) {
    reply.code(400).send({ message: 'Wrong password.' });
    return;
  }

  let [_code, _response] = await userController.getUserRoleByID(dbID);
  if (_code !== 200) {
    reply.code(_code).send(_response);
    return;
  }

  let token = createToken(_response.role, dbID);

  reply.code(200).send({ message: 'OK', token: token });
  return;
};

export const userRegistration = async (request: any, reply: any) => {
  const { name, surname, email, password } = request.body;
  console.log('Attempting to register new user.');
  let [code, response] = await userController.emailExists(email);
  if (code !== 200) {
    reply.code(code).send(response);
    return;
  }

  const salt = createSalt();
  const hPassword = hashPassword(password, salt);

  let [_code, _response] = await userController.createNewUser(
    name,
    surname,
    email,
    hPassword,
    salt,
    'u_student'
  );

  reply.code(_code).send(_response);
  return;
};

export const changeUserPassword = async (request: any, reply: any) => {
  const { currentPassword, newPassword } = request.body;
  const { id } = request.query;

  let [code, response] = await userController.getUserCredentialsById(id);

  if (code !== 200) {
    reply.code(code).send(response);
    return;
  }

  const dbPassword = response.password;
  const dbSalt = response.salt;

  const hashedPassword = hashPassword(currentPassword, dbSalt);
  if (hashedPassword !== dbPassword) {
    reply.code(400).send({ message: 'Wrong password.' });
    return;
  }

  const newHashedPassword = hashPassword(newPassword, dbSalt);

  let [_code, _response] = await userController.changeUserPassword(
    id,
    newHashedPassword
  );
  reply.code(_code).send(_response);
  return;
};
