import MainController from '../../controllers/mainController';

const mainController = new MainController();

export const loginHandler = async (request: any, reply: any) => {
  const { email, password } = request.body;
  //   let response = await mainController.auth_test();
  console.log(email, password);
  return reply.code(200).send('OK');
};

export const registrationHandler = async (request: any, reply: any) => {
  const { name, surname, email, password } = request.body;
  let [code, response] = await mainController.registerNewUser(
    name,
    surname,
    email,
    password
  );
  return reply.code(code).send(response);
};
