import ExerciseController from '../../database/exerciseController';

const exerciseController = new ExerciseController();

export const getExerciseTree = async (request: any, reply: any) => {
  // console.log('preslo to')
  let [code, response] = await exerciseController.getExerciseTree();
  reply.code(code).send(response);
  return;
};

export const getExercise = async (request: any, reply: any) => {
    const { exercise_id } = request.query;
    let [code, response] = await exerciseController.getExercise(exercise_id);
    reply.code(code).send(response);
    return;
  };
