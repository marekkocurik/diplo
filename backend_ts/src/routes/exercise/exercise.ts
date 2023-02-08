import MainController from '../../controllers/mainController';

const mainController = new MainController();

export const listExercises = async (request:any, reply:any) => {
    let [code, response] = await mainController.getExercises();
    return reply.code(code).send(response);
}