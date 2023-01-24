const fastify = require('fastify')();

fastify.register(require('./routes/routes'));

fastify.get('/ping', async (request: any, reply: any) => {
  return 'pong\n';
});

fastify.listen({ port: 8080 }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
