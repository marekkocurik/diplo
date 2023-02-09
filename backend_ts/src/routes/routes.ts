import { userLogin, userRegistration } from '../controllers/auth/auth';
import { getExerciseTree, getExercise } from '../controllers/exercise/exercise';
import { jwt_secret, fe_ip_address } from '../../env-config';
const jwt = require('jsonwebtoken');

export default async function routes(server: any) {
  const checkJWT = async (req: any, reply: any) => {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, jwt_secret);
      // console.log(decoded.role);
    } catch (e) {
      console.log('token expired');
      //.headers({'Origin': 'http://localhost:8080'})
      // reply.redirect(fe_ip_address);
      reply.code(401).send({ message: 'nejde to' });
      // reply.code(302).redirect(fe_ip_address).send({ message: 'Token is expired.' });
      return;
    }
  };

  server.post('/auth/login', userLogin);
  server.post('/auth/register', userRegistration);
  server.get('/home/exercise-tree', /*{ preHandler: checkJWT },*/ getExerciseTree);
  server.get('/home/exercise', /*{ preHandler: checkJWT },*/ getExercise);
}
