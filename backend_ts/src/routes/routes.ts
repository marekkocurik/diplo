// import * as loginRoutes from './auth/login';
// import port from '../../env-config';
// import MainController from '../controllers/mainController';
import { loginHandler } from './auth/login';

// const mainController = new MainController();

export default async function routes(server: any) {
  // server.register(loginRoutes);

  // server.get('/test', async (request: any, reply: any) => {
  //   return reply
  //     .code(200)
  //     .send(
  //       'Welcome. Endpoint documentation is available at route /documentation.'
  //     );
    // const client = await pool.connect();
    // if(client === undefined) {
    // 	console.error('Error acquiring client.');
    // 	return [500, { message: 'Error acquiring client.' }];
    // } else {
    //     return [200, { message: 'OK' }];
    // }
  // });

  // server.get('/testAuth', async (request:any, reply: any)=>{
  //   let [code, response] = await mainController.auth_test();
  //   return reply.code(code).send(response);
  // })

  server.post('/auth/login', loginHandler);

};