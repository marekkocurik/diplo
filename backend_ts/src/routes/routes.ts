import { userLogin, userRegistration } from '../controllers/auth/auth';
import {
  getExerciseTree,
  getExercise,
  getQueryResult,
  // getExpectedResult,
} from '../controllers/exercise/exercise';
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
      // console.log(decoded.role);
    } catch (e) {
      console.log('token is expired');
      // reply.redirect(fe_ip_address);
      // reply.code(302).redirect(fe_ip_address).headers({'Origin': 'http://localhost:8080'}).send({ message: 'Token is expired.' });
      reply.code(302).send({ message: 'Token is expired.' });
      return;
    }
  };

  const sayHello = async (req:any, reply:any) => {
    reply.code(200).send({message: "Ya man"});
  }

  server.get('/hello', sayHello);
  server.post('/auth/login', userLogin);
  server.post('/auth/register', userRegistration);
  server.get('/home/exercise-tree', /*{ preHandler: checkJWT },*/ getExerciseTree);
  server.get('/home/exercise', /*{ preHandler: checkJWT },*/ getExercise);
  server.get('/home/query-result', { preHandler: checkJWT }, getQueryResult);
  // server.get('/home/expected-result', { preHandler: checkJWT }, getExpectedResult);
}
