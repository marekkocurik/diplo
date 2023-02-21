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

export const getQueryResult = async (request:any, reply:any) => {
  const { role, studentQuery } = request.query;
  let [code, response] = await exerciseController.getQueryResult(role, studentQuery);
  reply.code(code).send(response);
  return;
}

// export const getExpectedResult = async (request:any, reply:any) => {
//   const { exercise_id } = request.query;
//   let [code, response] = await exerciseController.getExpectedResult(exercise_id);
//   reply.code(code).send(response);
//   return;
// }
