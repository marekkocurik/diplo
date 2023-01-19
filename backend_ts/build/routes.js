"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function routes(server) {
    server.get('/test', async (request, reply) => {
        return reply.code(200).send("Welcome. Endpoint documentation is available at route /documentation.");
        // const client = await pool.connect();
        // if(client === undefined) {
        // 	console.error('Error acquiring client.');
        // 	return [500, { message: 'Error acquiring client.' }];
        // } else {
        //     return [200, { message: 'OK' }];
        // }
    });
}
exports.default = routes;
