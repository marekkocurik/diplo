"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: __dirname + '/./../.env' });
const env_config_1 = require("../env-config");
const fastify = require('fastify')();
fastify.register(require('./routes/routes'));
fastify.register(require('@fastify/cors'), {
    // methods: ['GET', 'PUT', 'POST', 'DELETE']
    credentials: true,
    origin: env_config_1.fe_ip_address,
});
fastify.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
