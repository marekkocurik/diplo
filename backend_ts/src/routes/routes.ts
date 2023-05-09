import { testAST } from '../endpointControllers/ast/abstractSyntaxTree';
import { updateDatabase } from '../endpointControllers/maintenance/maintenance';
import { userLogin, userRegistration, changeUserPassword, getUsername } from '../endpointControllers/auth/auth';
import {
  getExerciseTree,
  getExercise,
  getExerciseHistory,
  getUserExerciseSolutions,
  getQueryExpectedResult,
  getQueryTestResult,
  getQuerySubmitResult,
  getExerciseLeaderboard,
  updateShowSolutions,
  getLeaderboard,
} from '../endpointControllers/exercise/exercise';
import { getHelp, updateRecommendationRating, updateRecommendationVisited } from '../endpointControllers/help/helper';
import { jwt_secret, fe_ip_address } from '../env-config';
const jwt = require('jsonwebtoken');

export default async function routes(server: any) {
  const checkJWT = async (req: any, reply: any) => {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, jwt_secret);
      if (!req.query) req.query = {};
      req.query.role = decoded.role;
      req.query.id = decoded.id;
      req.query.cluster = decoded.cluster;
    } catch (e) {
      reply.code(302).send({ message: 'Token is expired.' });
      return;
    }
  };

  const sayHello = async (req: any, reply: any) => {
    console.log('Ya man.');
    reply.code(200).send({ message: 'Ya man LETS GOO' });
  };

  // server.get('/maintenance/database-update', updateDatabase); 
  // server.get('/test-ast', testAST);
  server.get('/hello', sayHello);
  server.post('/auth/login', userLogin);
  server.post('/auth/register', userRegistration);
  // server.post('/auth/reset-password');
  server.get('/home/username', { preHandler: checkJWT }, getUsername);
  server.get('/home/exercise-tree', { preHandler: checkJWT }, getExerciseTree);
  server.get('/home/exercise', { preHandler: checkJWT }, getExercise);
  server.get('/home/exercise-history', { preHandler: checkJWT }, getExerciseHistory);
  server.get('/home/exercise-solutions-user', { preHandler: checkJWT }, getUserExerciseSolutions);

  server.post('/home/hints/update-visited', { preHandler: checkJWT }, updateRecommendationVisited);
  server.post('/home/hints/update-rating', { preHandler: checkJWT }, updateRecommendationRating);
  server.get('/home/exercise/show-solutions-others', { preHandler: checkJWT }, getExerciseLeaderboard);
  server.post('/home/exercise/update-finished', { preHandler: checkJWT }, updateShowSolutions);
  server.get('/home/leaderboard', { preHandler: checkJWT }, getLeaderboard);

  server.get('/home/query-expected-result', { preHandler: checkJWT }, getQueryExpectedResult);
  server.get('/home/query-test-result', { preHandler: checkJWT }, getQueryTestResult);
  server.get('/home/query-submit-result', { preHandler: checkJWT }, getQuerySubmitResult);
  server.post('/home/profile/change-password', { preHandler: checkJWT }, changeUserPassword);
  server.get('/home/get-help', { preHandler: checkJWT }, getHelp);
}
