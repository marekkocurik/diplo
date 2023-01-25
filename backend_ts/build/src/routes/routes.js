"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { pool } from '../db_connection/pgController';
const pgController_1 = __importDefault(require("../db_connection/pgController"));
const dbcontroller = new pgController_1.default();
async function routes(server) {
    server.get('/test', async (request, reply) => {
        return reply
            .code(200)
            .send('Welcome. Endpoint documentation is available at route /documentation.');
        // const client = await pool.connect();
        // if(client === undefined) {
        // 	console.error('Error acquiring client.');
        // 	return [500, { message: 'Error acquiring client.' }];
        // } else {
        //     return [200, { message: 'OK' }];
        // }
    });
    server.get('/db', async (request, reply) => {
        let response = await dbcontroller.testDB();
        return reply.code(200).send(response);
    });
}
exports.default = routes;
