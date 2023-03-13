import ExerciseController from '../../database/exerciseController';

interface QueryCompareResponse {
  queryResult: {};
  solution_success: string;
  message?: string;
}

const exerciseController = new ExerciseController();

const queryResultsMatch = (query: Object, expected: Object) => {
  if (JSON.stringify(query) === JSON.stringify(expected)) return true;
  return false;
};

export const getExercise = async (request: any, reply: any) => {
  const { role, id, exercise_id } = request.query;
  try {
    let [exercise_code, exercise_response] = await exerciseController.getExerciseByID(exercise_id);
    if (exercise_code !== 200) {
      reply.code(exercise_code).send(exercise_response);
      return;
    }
    let [solution_code, solution_response] = await exerciseController.getExerciseSolutionByExerciseID(exercise_id);
    if (solution_code !== 200) {
      reply.code(solution_code).send(solution_response);
      return;
    }
    let solution_query = solution_response.query;
    let [query_code, query_response] = await exerciseController.getQueryResult(role, solution_query);
    if (query_code !== 200) {
      reply.code(query_code).send(query_response);
      return;
    }
    let [hist_code, hist_response] = await exerciseController.getExerciseAnswersByExerciseIDAndUserID(exercise_id, id);
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
    reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise info' });
    return;
  }
};

export const getExerciseTree = async (request: any, reply: any) => {
  // TODO: pridat aj kontrolu uz vyriesenych uloh a na FE to farebne rozlisit
  const { id } = request.query;
  try {
    let [chapters_code, chapters_response] = await exerciseController.getExerciseChapters();
    if (chapters_code !== 200) {
      reply.code(chapters_code).send(chapters_response);
      return;
    }
    let exercise_ids: number[] = [];
    let i = 1;
    for (let chapter of chapters_response.chapters) {
      let [c_e_code, c_e_response] = await exerciseController.getChapterExercisesByChapterID(chapter.id);
      if (c_e_code !== 200) {
        reply.code(c_e_code).send(c_e_response);
        return;
      }

      let j = 1;
      for (let exercise of c_e_response.exercises) {
        exercise._id = j++;
        exercise_ids.push(exercise.id);
      }
      chapter._id = i++;
      chapter.exercises = c_e_response.exercises;
    }
    let [ex_code, ex_response] = await exerciseController.exerciseIsSolved(id, exercise_ids);
    if (ex_code === 200) {
      for (let c of chapters_response.chapters) {
        for (let e of c.exercises) {
          let o = ex_response.user_exercises_solved.find(item => item.id === e.id);
          let st = o?.status;
          e.solved = st? st:false;
        }
      }
    }

    reply.code(200).send(chapters_response.chapters);
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise tree' });
    return;
  }
};

const compareQueries = async (
  reply: any,
  role: string,
  solution: string,
  queryToExecute: string,
  user_id: number,
  exercise_id: number,
  action: string
): Promise<[Number, QueryCompareResponse]> => {
  try {
    let response = {
      queryResult: {},
      solution_success: '',
      message: 'OK',
    };
    let [query_expected_code, query_expected_response] = await exerciseController.getQueryResult(role, solution);
    if (query_expected_code !== 200) {
      reply.code(query_expected_code).send(query_expected_response);
      return [-1, response];
    }
    let reply_code: Number = 200,
      reply_message: string = '';
    try {
      let [query_code, query_response] = await exerciseController.getQueryResult(role, queryToExecute);
      if (query_code !== 200) {
        reply.code(query_code).send(query_response);
        return [-1, response];
      }
      response.queryResult = query_response;
    } catch (e) {
      response.solution_success = 'ERROR';
      reply_code = 500;
      if (e instanceof Error) reply_message = e.message;
      else reply_message = 'Unknown error occured while trying to ' + action + ' user query';
    }
    if (response.solution_success !== 'ERROR') {
      if (queryResultsMatch(query_expected_response, response.queryResult)) {
        console.log('Queries are the same');
        response.solution_success = 'COMPLETE'; // TODO: solution_success = action = 'test'? 'PARTIAL' : 'COMPLETE'
      } else {
        console.log('comapring failed');
        response.solution_success = 'WRONG'; // TODO: solution_success = action 'test'? 'WRONG' : 'PARTIAL'
      }
    }
    let [insert_code, insert_response] = await exerciseController.insertNewAnswer(
      user_id,
      exercise_id,
      queryToExecute,
      response.solution_success,
      action === 'test' ? false : true
    );
    if (insert_code !== 200) {
      reply.code(insert_code).send(insert_response);
      return [-1, response];
    }
    if (reply_code === 500) {
      reply.code(reply_code).send({ message: reply_message });
      return [-1, response];
    }
    return [1, response];
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to ' + action + ' user query' });
    return [-1, { queryResult: {}, solution_success: '' }];
  }
};

export const getQueryTestResult = async (request: any, reply: any) => {
  const { role, id, exerciseId, queryToExecute, solution } = request.query;
  let [status, response] = await compareQueries(reply, role, solution, queryToExecute, id, exerciseId, 'test');
  if (status === 1) reply.code(200).send(response);
  return;
};

export const getQuerySubmitResult = async (request: any, reply: any) => {
  const { role, id, exerciseId, queryToExecute, solution } = request.query;
  let [status, response] = await compareQueries(reply, role, solution, queryToExecute, id, exerciseId, 'submit');

  try {
    if (status === 1) {
      if (response.solution_success === 'COMPLETE') {
        let [sol_code, sol_response] = await exerciseController.getExerciseSolutionsByExerciseID(exerciseId);
        if (sol_code !== 200) {
          reply.code(sol_code).send(sol_response);
          return;
        }
        let new_solution: string = queryToExecute as string;
        if (new_solution.charAt(new_solution.length - 1) !== ';') new_solution += ';'
        for (let s of sol_response.solutions) {
          if (new_solution.toLowerCase() === (s.query as string).toLowerCase()) {
            reply.code(200).send(response);
            return;
          }
        }
        let [save_code, save_response] = await exerciseController.insertNewSolution(id, exerciseId, new_solution);
        if (save_code !== 200) {
          reply.code(save_code).send(save_response);
          return;
        }
        reply.code(200).send(response);
      } else {
        reply.code(200).send(response); // TODO: 200?
      } 
    }
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to insert new solution' });
    return;
  }
};
