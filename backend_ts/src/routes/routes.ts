import { updateDatabase, testAST } from '../controllers/ast/abstractSyntaxTree';
import { userLogin, userRegistration, changeUserPassword, getUsername } from '../controllers/auth/auth';
import {
  getExerciseTree,
  getExercise,
  getExerciseHistory,
  getUserExerciseSolutions,
  getQueryExpectedResult,
  getQueryTestResult,
  getQuerySubmitResult,
} from '../controllers/exercise/exercise';
import { getHelp } from '../controllers/help/helper';
import { jwt_secret, fe_ip_address } from '../env-config';
const jwt = require('jsonwebtoken');

export default async function routes(server: any) {
  const checkJWT = async (req: any, reply: any) => {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, jwt_secret);
      console.log('token is valid');
      if (!req.query) req.query = {};
      req.query.role = decoded.role;
      req.query.id = decoded.id;
      // console.log('decoded role: ' +decoded.role, ' decoded id: ' +decoded.id);
    } catch (e) {
      console.log('token is expired');
      // reply.redirect(fe_ip_address);
      // reply.code(302).redirect(fe_ip_address).headers({'Origin': 'http://localhost:8080'}).send({ message: 'Token is expired.' });
      reply.code(302).send({ message: 'Token is expired.' });
      return;
    }
  };

  const sayHello = async (req: any, reply: any) => {
    console.log('Ya man.');
    reply.code(200).send({ message: 'Ya man LETS GOO' });
  };

  // server.get('/database-update', updateDatabase);
  server.get('/test-ast', testAST);
  server.get('/hello', sayHello);
  server.post('/auth/login', userLogin);
  server.post('/auth/register', userRegistration);
  // server.post('/auth/reset-password');
  server.get('/home/username', { preHandler: checkJWT }, getUsername);
  server.get('/home/exercise-tree', { preHandler: checkJWT }, getExerciseTree);
  server.get('/home/exercise', { preHandler: checkJWT }, getExercise);
  server.get('/home/exercise-history', { preHandler: checkJWT }, getExerciseHistory);
  server.get('/home/exercise-solutions-user', { preHandler: checkJWT }, getUserExerciseSolutions);
  server.get('/home/query-expected-result', { preHandler: checkJWT }, getQueryExpectedResult);
  server.get('/home/query-test-result', { preHandler: checkJWT }, getQueryTestResult);
  server.get('/home/query-submit-result', { preHandler: checkJWT }, getQuerySubmitResult);
  server.post('/home/profile/change-password', { preHandler: checkJWT }, changeUserPassword);
  server.get('/home/get-help', { preHandler: checkJWT }, getHelp);
}
