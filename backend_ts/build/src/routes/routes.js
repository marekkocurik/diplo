"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../controllers/auth/auth");
const exercise_1 = require("../controllers/exercise/exercise");
const env_config_1 = require("../../env-config");
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
            // console.log(decoded.role);
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
        reply.code(200).send({ message: "Ya man" });
    };
    server.get('/hello', sayHello);
    server.post('/auth/login', auth_1.userLogin);
    server.post('/auth/register', auth_1.userRegistration);
    server.get('/home/exercise-tree', /*{ preHandler: checkJWT },*/ exercise_1.getExerciseTree);
    server.get('/home/exercise', /*{ preHandler: checkJWT },*/ exercise_1.getExercise);
    server.get('/home/query-result', { preHandler: checkJWT }, exercise_1.getQueryResult);
    // server.get('/home/expected-result', { preHandler: checkJWT }, getExpectedResult);
}
exports.default = routes;
