import ExerciseController from '../../database/exerciseController';

const exerciseController = new ExerciseController();

const queryResultsMatch = (query: Object, expected: Object) => {
  if (JSON.stringify(query) === JSON.stringify(expected)) return true;
  return false;
};

export const getExercise = async (request: any, reply: any) => {
  const { role, id, exercise_id } = request.query;
  try {
    let [exercise_code, exercise_response] =
      await exerciseController.getExerciseByID(exercise_id);
    if (exercise_code !== 200) {
      reply.code(exercise_code).send(exercise_response);
      return;
    }
    let [solution_code, solution_response] =
      await exerciseController.getExerciseSolutionByExerciseID(exercise_id);
    if (solution_code !== 200) {
      reply.code(solution_code).send(solution_response);
      return;
    }
    let solution_query = solution_response.solution;
    let [query_code, query_response] = await exerciseController.getQueryResult(
      role,
      solution_query
    );
    if (query_code !== 200) {
      reply.code(query_code).send(query_response);
      return;
    }
    let [hist_code, hist_response] =
      await exerciseController.getExerciseAnswersByExerciseIDAndUserID(
        exercise_id,
        id
      );
    if (hist_code !== 200) {
      reply.code(hist_code).send(hist_response);
      return;
    }
    let response = {
      ...exercise_response,
      solution: solution_query,
      queryResult: query_response,
      history: hist_response.answers,
    };
    reply.code(200).send(response);
    return;
  } catch (e) {
    if (e instanceof Error) reply.code(500).send({ message: e.message });
    else
      reply
        .code(500)
        .send({
          message:
            'Unknown error occured while trying to receive exercise info',
        });
    return;
  }
};

export const getExerciseTree = async (request: any, reply: any) => {
  // TODO: pridat aj kontrolu uz vyriesenych uloh a na FE to farebne rozlisit
  // let [code, response] = await exerciseController.getExerciseTree();
  // reply.code(code).send(response);
  // return;

  const { id } = request.query;
  try {
    let [chapters_code, chapters_response] =
      await exerciseController.getExerciseChapters();
    if (chapters_code !== 200) {
      reply.code(chapters_code).send(chapters_response);
      return;
    }
    let i = 1;
    for (let chapter of chapters_response.chapters) {
      let [c_e_code, c_e_response] =
        await exerciseController.getChapterExercisesByChapterID(chapter.id);
      if (c_e_code !== 200) {
        reply.code(c_e_code).send(c_e_response);
        return;
      }

      let j = 1;
      for (let exercise of c_e_response.exercises) exercise._id = j++;

      chapter._id = i++;
      chapter.exercises = c_e_response.exercises;
    }
    reply.code(200).send(chapters_response.chapters);
    return;
  } catch (e) {
    if (e instanceof Error) reply.code(500).send({ message: e.message });
    else
      reply
        .code(500)
        .send({
          message:
            'Unknown error occured while trying to receive exercise tree',
        });
    return;
  }
};

export const getQueryExpectedResult = async (request: any, reply: any) => {
  const { role, queryToExecute } = request.query;
  let [code, response] = await exerciseController.getQueryResult(
    role,
    queryToExecute
  );
  reply.code(code).send(response);
  return;
};

export const getQueryTestResult = async (request: any, reply: any) => {
  const { role, exerciseId, queryToExecute, solution } = request.query;
  let [code, expectedResult] = await exerciseController.getQueryResult(
    role,
    solution
  );
  if (code !== 200) {
    reply.code(code).send(expectedResult);
    return;
  }

  let [_code, queryResult] = await exerciseController.getQueryResult(
    role,
    queryToExecute
  );
  if (_code !== 200) {
    reply.code(_code).send(queryResult);
    return;
  }

  let result: any = {};
  result.queryResult = queryResult;
  if (queryResultsMatch(queryResult, expectedResult)) {
    console.log('Queries are the same');
    result.evaluation = 'COMPLETE';
  } else {
    console.log('comapring failed');
    result.evaluation = 'WRONG';
  }

  //ulozenie do answers (historie)
  // let [__code, response] = await exerciseController.insertNewAnswer(role, queryToExecute, exerciseId);

  reply.code(_code).send(result);
  return;
};

export const getQuerySubmitResult = async (request: any, reply: any) => {
  const { role, queryToExecute, solution, exerciseId } = request.query;
  let [code, expectedResult] = await exerciseController.getQueryResult(
    role,
    solution
  );
  if (code !== 200) {
    reply.code(code).send(expectedResult);
    return;
  }

  let [_code, queryResult] = await exerciseController.getQueryResult(
    role,
    queryToExecute
  );
  if (_code !== 200) {
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
};
