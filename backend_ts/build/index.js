"use strict";
const fastify = require('fastify')();
fastify.register(require('./routes/routes'));
fastify.get('/ping', async (request, reply) => {
    return 'piong\n';
});
fastify.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
