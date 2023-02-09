require('dotenv').config({ path: __dirname + '/./../.env' });
import { fe_ip_address } from '../env-config';

const fastify = require('fastify')();

fastify.register(require('./routes/routes'));

fastify.register(require('@fastify/cors'), {
  // methods: ['GET', 'PUT', 'POST', 'DELETE']
  credentials: true,
  origin: fe_ip_address,
});

fastify.listen({ port: 8080 }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
