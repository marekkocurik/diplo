import ExerciseController from '../../database/exerciseController';

const exerciseController = new ExerciseController();

const queryResultsMatch = (query:Object, expected:Object) => {
  if (JSON.stringify(query) === JSON.stringify(expected)) return true;
  return false;
};

export const getExerciseTree = async (request: any, reply: any) => {
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

export const getQueryExpectedResult = async (request:any, reply:any) => {
  const { role, queryToExecute } = request.query;
  let [code, response] = await exerciseController.getQueryResult(role, queryToExecute);
  reply.code(code).send(response);
  return;
}

export const getQueryTestResult = async (request:any, reply:any) => {
  const { role, queryToExecute, solution } = request.query;
  let [code, expectedResult] = await exerciseController.getQueryResult(role, solution);
  if(code !== 200) {
    reply.code(code).send(expectedResult);
    return;
  }

  let[_code, queryResult] = await exerciseController.getQueryResult(role, queryToExecute);
  if(_code !== 200) {
    reply.code(_code).send(queryResult);
    return;
  }

  if (queryResultsMatch(queryResult, expectedResult)) {
    console.log('Queries are the same');
  } else {
    console.log('comapring failed');
  }

  reply.code(_code).send(queryResult);
  return;
}

// export const getExpectedResult = async (request:any, reply:any) => {
//   const { exercise_id } = request.query;
//   let [code, response] = await exerciseController.getExpectedResult(exercise_id);
//   reply.code(code).send(response);
//   return;
// }
