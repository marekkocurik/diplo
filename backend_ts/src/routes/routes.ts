import { pool } from '../db_connection/pgController';

export default async function routes(server: any) {
  server.get('/test', async (request: any, reply: any) => {
    return reply
      .code(200)
      .send(
        'Welcome. Endpoint documentation is available at route /documentation.'
      );
    // const client = await pool.connect();
    // if(client === undefined) {
    // 	console.error('Error acquiring client.');
    // 	return [500, { message: 'Error acquiring client.' }];
    // } else {
    //     return [200, { message: 'OK' }];
    // }
  });
}
