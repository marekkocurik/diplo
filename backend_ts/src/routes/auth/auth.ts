import MainController from '../../controllers/mainController';

const mainController = new MainController();

export const userLogin = async (request: any, reply: any) => {
  const { email, password } = request.body;
  let [code, response] = await mainController.login(email, password);
  return reply.code(code).send(response);
};

export const userRegistration = async (request: any, reply: any) => {
  const { name, surname, email, password } = request.body;
  let [code, response] = await mainController.registerNewUser(
    name,
    surname,
    email,
    password
  );
  return reply.code(code).send(response);
};
