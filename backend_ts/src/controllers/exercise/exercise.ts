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
  const { role, exerciseId, queryToExecute, solution } = request.query;
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
    // TODO: ak sa query zhoduju, treba povedat FE, ze je to spravne a FE vykresli, ze je to spravne
  } else {
    console.log('comapring failed');
    // TODO: opak vetvy IF
  }

  //ulozenie do answers (historie)
  // let [__code, response] = await exerciseController.insertNewAnswer(role, queryToExecute, exerciseId);


  reply.code(_code).send(queryResult);
  return;
}

export const getQuerySubmitResult = async (request:any, reply:any) => {
  const { role, queryToExecute, solution, exerciseId } = request.query;
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
    // TODO: ak sa query zhoduju, treba porovnat vsetky solutions. Ak solution neexistuje, ulozi sa nove
    // get Solutions pre exerciseId
  } else {
    console.log('comapring failed');
    // TODO: ak sa query nezhoduju, treba dat FE vediet ze vysledok je zly
  }

  if (queryResultsMatch(queryResult, expectedResult)) {
    // TODO:
    // 1. porovnanie query s excepted pre primarnu databazu - rovnake ako ked sa testuje query, pretoze clovek moze odovzdat 
    // 2. porovnanie query s expected pre sekundarnu databazu
  } else {
    console.log('comapring failed');
    // TODO: ak sa query nezhoduju, treba dat FE vediet ze vysledok je zly
  }

  reply.code(_code).send(queryResult);
  return;
}

