// import { pool } from '../db_connection/pgController';
import DBController from '../db_connection/pgController';
import port from '../../env-config';

const dbcontroller = new DBController();

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

  server.get('/db', async (request:any, reply: any)=>{
    let response = await dbcontroller.testDB();
    return reply.code(200).send(response);
  })

  server.post('/auth/login', async (request:any, reply: any)=>{
    const {email, password} = request.body;
    console.log(email, password);
    return reply.code(200).send("");
  })
};