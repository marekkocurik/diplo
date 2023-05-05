"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../endpointControllers/auth/auth");
const exercise_1 = require("../endpointControllers/exercise/exercise");
const helper_1 = require("../endpointControllers/help/helper");
const env_config_1 = require("../env-config");
const jwt = require('jsonwebtoken');
async function routes(server) {
    const checkJWT = async (req, reply) => {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const decoded = jwt.verify(token, env_config_1.jwt_secret);
            console.log('token is valid');
            if (!req.query)
                req.query = {};
            req.query.role = decoded.role;
            req.query.id = decoded.id;
            req.query.cluster = decoded.cluster;
            // console.log('decoded role: ' +decoded.role, ' decoded id: ' +decoded.id);
        }
        catch (e) {
            console.log('token is expired');
            // reply.redirect(fe_ip_address);
            // reply.code(302).redirect(fe_ip_address).headers({'Origin': 'http://localhost:8080'}).send({ message: 'Token is expired.' });
            reply.code(302).send({ message: 'Token is expired.' });
            return;
        }
    };
    const sayHello = async (req, reply) => {
        console.log('Ya man.');
        reply.code(200).send({ message: 'Ya man LETS GOO' });
    };
    // server.get('/maintenance/database-update', updateDatabase); 
    // server.get('/test-ast', testAST);
    server.get('/hello', sayHello);
    server.post('/auth/login', auth_1.userLogin);
    server.post('/auth/register', auth_1.userRegistration);
    // server.post('/auth/reset-password');
    server.get('/home/username', { preHandler: checkJWT }, auth_1.getUsername);
    server.get('/home/exercise-tree', { preHandler: checkJWT }, exercise_1.getExerciseTree);
    server.get('/home/exercise', { preHandler: checkJWT }, exercise_1.getExercise);
    server.get('/home/exercise-history', { preHandler: checkJWT }, exercise_1.getExerciseHistory);
    server.get('/home/exercise-solutions-user', { preHandler: checkJWT }, exercise_1.getUserExerciseSolutions);
    server.get('/home/query-expected-result', { preHandler: checkJWT }, exercise_1.getQueryExpectedResult);
    server.get('/home/query-test-result', { preHandler: checkJWT }, exercise_1.getQueryTestResult);
    server.get('/home/query-submit-result', { preHandler: checkJWT }, exercise_1.getQuerySubmitResult);
    server.post('/home/profile/change-password', { preHandler: checkJWT }, auth_1.changeUserPassword);
    server.get('/home/get-help', { preHandler: checkJWT }, helper_1.getHelp);
}
exports.default = routes;
