const fastify = require('fastify')();
require('dotenv').config({ path: __dirname+'/./../.env' });

fastify.register(require('./routes/routes'));

fastify.listen({ port: 8080 }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
