require('dotenv').config({ path: __dirname + '/./../.env' });
import { fe_ip_address } from './env-config';

const fastify = require('fastify')();

fastify.register(require('./routes/routes'));

fastify.register(require('@fastify/cors'), {
  // methods: ['GET', 'PUT', 'POST', 'DELETE']
  credentials: true,
  origin: [fe_ip_address, 'https://mk-dp-fe.azurewebsites.net', 'http://mk-dp-fe.azurewebsites.net'],
});

// fastify.register(require('@fastify/cors'));

fastify.listen({ port: 80, host: '0.0.0.0' }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
