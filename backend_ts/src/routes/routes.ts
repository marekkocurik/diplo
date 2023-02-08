import { userLogin, userRegistration } from './auth/auth';
import { listExercises } from './exercise/exercise';
import { jwt_secret } from '../../env-config';
const jwt = require('jsonwebtoken');

export default async function routes(server: any) {
  const checkJWT = async (req: any, reply: any) => {
    try {
      const token = (req.headers.authorization).replace('Bearer ', '');
      const decoded = jwt.verify(token, jwt_secret);
      console.log(decoded.exp);
    } catch (e) {
      console.log(e);
      reply.code(401).send({ message: 'Token is expired.' });
      reply.code(302).header('Location', '/auth/login').send();
    }
  };

  // server.post('/auth/login', { preHandler: test_hook }, loginHandler);
  server.post('/auth/login', userLogin);
  server.post('/auth/register', userRegistration);
  server.get('/home/exercises', { preHandler: checkJWT }, listExercises);
}
