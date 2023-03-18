import { ok } from 'assert';
import ExerciseController from '../../database/exerciseController';

interface GeneralResponse {
  message: string;
}

interface QueryCompareResponse extends GeneralResponse {
  query_result: {};
  execution_time: number;
  solution_success: string;
}

interface QueryExecuteReponse extends GeneralResponse{
  queryResult: {};
  executionTime: number;
}

interface QueryTestResponse extends QueryExecuteReponse {
  queriesMatch: boolean;
}

const exerciseController = new ExerciseController();

const queryResultsMatch = (solution_query_result: Object, student_query_result: Object):boolean => {
  if (JSON.stringify(solution_query_result) === JSON.stringify(student_query_result)) return true;
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
      queryResult: query_response.queryResult,
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
    let ex_ids_answers: number[] = [];
    let [ex_code, ex_response] = await exerciseController.checkSolvedExercisesById(id, exercise_ids);
    if (ex_code === 200) {
      for (let c of chapters_response.chapters) {
        c.solved = true;
        for (let e of c.exercises) {
          let o = ex_response.user_exercises_solved.find((item) => item.id === e.id);
          let st = o?.status;
          e.solved = st ? st : false;
          if (!e.solved) ex_ids_answers.push(e.id);
          if (c.solved && !e.solved) c.solved = false;
        }
      }
      let [ex__code, ex__response] = await exerciseController.checkStartedExercisesById(id, ex_ids_answers);
      if (ex__code === 200) {
        for (let c of chapters_response.chapters) {
          for (let e of c.exercises) {
            let o = ex__response.user_exercises_started.find((item) => item.id === e.id);
            let st = o?.status;
            e.started = st ? st : false;
          }
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

// const compareQueries = async (
//   reply: any,
//   role: string,
//   solution: string,
//   queryToExecute: string,
//   user_id: number,
//   exercise_id: number,
//   action: string
// ): Promise<[Number, QueryCompareResponse]> => {
//   try {
//     let response = {
//       queryResult: {},
//       execution_time: 0,
//       solution_success: '',
//       message: 'OK',
//     };
//     let [query_expected_code, query_expected_response] = await exerciseController.getQueryResult(role, solution);
//     if (query_expected_code !== 200) {
//       reply.code(query_expected_code).send(query_expected_response);
//       return [-1, response];
//     }
//     let reply_code: Number = 200,
//       reply_message: string = '';
//     try {
//       let [query_code, query_response] = await exerciseController.getQueryResult(role, queryToExecute);
//       if (query_code !== 200) {
//         reply.code(query_code).send(query_response);
//         return [-1, response];
//       }
//       response.queryResult = query_response.queryResult;
//       response.execution_time = query_response.execution_time;
//     } catch (e) {
//       response.solution_success = 'ERROR';
//       reply_code = 500;
//       if (e instanceof Error) reply_message = e.message;
//       else reply_message = 'Unknown error occured while trying to ' + action + ' user query';
//     }
//     if (response.solution_success !== 'ERROR') {
//       if (queryResultsMatch(query_expected_response.queryResult, response.queryResult)) {
//         response.solution_success = 'COMPLETE'; // TODO: solution_success = action = 'test'? 'PARTIAL' : 'COMPLETE'
//       } else {
//         response.solution_success = 'WRONG'; // TODO: solution_success = action 'test'? 'WRONG' : 'PARTIAL'
//       }
//     }
//     let [insert_code, insert_response] = await exerciseController.insertNewAnswer(
//       user_id,
//       exercise_id,
//       queryToExecute,
//       response.solution_success,
//       response.execution_time,
//       action === 'test' ? false : true
//     );
//     if (insert_code !== 200) {
//       reply.code(insert_code).send(insert_response);
//       return [-1, response];
//     }
//     if (reply_code === 500) {
//       reply.code(reply_code).send({ message: reply_message });
//       return [-1, response];
//     }
//     return [1, response];
//   } catch (e) {
//     reply.code(500).send({ message: 'Unknown error occured while trying to ' + action + ' user query' });
//     return [-1, { queryResult: {}, solution_success: '', execution_time: 0 }];
//   }
// };

// export const getQueryTestResult = async (request: any, reply: any) => {
//   const { role, id, exerciseId, queryToExecute, solution } = request.query;
//   let [status, response] = await compareQueries(reply, role, solution, queryToExecute, id, exerciseId, 'test');
//   if (status === 1) reply.code(200).send(response);
//   return;
// };

// export const getQuerySubmitResult = async (request: any, reply: any) => {
//   const { role, id, exerciseId, queryToExecute, solution } = request.query;
//   let [status, response] = await compareQueries(reply, role, solution, queryToExecute, id, exerciseId, 'submit');

//   try {
//     if (status === 1) {
//       if (response.solution_success === 'COMPLETE') {
//         let [sol_code, sol_response] = await exerciseController.getExerciseSolutionsByExerciseID(exerciseId);
//         if (sol_code !== 200) {
//           reply.code(sol_code).send(sol_response);
//           return;
//         }
        // let new_solution: string = queryToExecute as string;
        // if (new_solution.charAt(new_solution.length - 1) !== ';') new_solution += ';';
        // for (let s of sol_response.solutions) {
        //   if (new_solution.toLowerCase() === (s.query as string).toLowerCase()) {
        //     reply.code(200).send(response);
        //     return;
        //   }
        // }
//         let [save_code, save_response] = await exerciseController.insertNewSolution(exerciseId, new_solution, response.execution_time);
//         if (save_code !== 200) {
//           reply.code(save_code).send(save_response);
//           return;
//         }
//         reply.code(200).send(response);
//       } else {
//         reply.code(200).send(response); // TODO: 200?
//       }
//     }
//     return;
//   } catch (e) {
//     reply.code(500).send({ message: 'Unknown error occured while trying to insert new solution' });
//     return;
//   }
// };



const executeQuery = async (role: string, query: string, action: string, queryType: string):Promise<[number, QueryExecuteReponse]> => {
  try {
    let [code, response] = await exerciseController.getQueryResult(role, query);
    return [code, response];
  } catch (e) {
    let response = {
      message: '',
      queryResult: {},
      executionTime: 0
    }
    if (e instanceof Error) {
      response.message = e.message;
      return [400, response];
    } else {
      response.message = 'Unknown error occured while trying to ' + action + ' ' + queryType + ' query';
      return [500, response];
    }
  }
}

const testQueries = async (role: string, solutionQuery: string, studentQuery: string, action: string):Promise<[number, QueryTestResponse]> => {
  let testResponse = {
    queriesMatch: false,
  }
  let [code, response] = await executeQuery(role, solutionQuery, action, 'solution');
  if (code !== 200) return [code, Object.assign(testResponse, response)];
  let solutionResult = response.queryResult;
  [code, response] = await executeQuery(role, studentQuery, action, 'user');
  if (code !== 200) return [code, Object.assign(testResponse, response)];
  let studentResult = response.queryResult;
  testResponse.queriesMatch = queryResultsMatch(solutionResult, studentResult);
  return [200, Object.assign(testResponse, response)];
}

const insertNewSolution = async (exerciseID: number, solution: string, executionTime: number):Promise<[number, GeneralResponse]> => {
  try {
    let [code, response] = await exerciseController.insertNewSolution(exerciseID, solution, executionTime);
    return [code, response];
  } catch (e) {
    return [500, { message: 'Unknown error occured while trying to insert new solution' }];
  }
}

const insertNewAnswer = async (userID: number, exerciseID: number, query: string, solutionSuccess: string, submitAttempt: boolean, executionTime: number):Promise<[number, GeneralResponse]> => {
  try {
    let [code, response] = await exerciseController.insertNewAnswer(
      userID,
      exerciseID,
      query,
      solutionSuccess,
      submitAttempt,
      executionTime
    );
    return [code, response];
  } catch(e) {
    return [500, { message: "Unknow error occured while trying to insert user's answer" }];
  }
}

const editQueryToSecondScheme = (query: string) => {
  const regex = /\scd\./g;
  const replacement = ' cd2.';
  const newQuery = query.replace(regex, replacement);
  return newQuery;
}

const checkIfSolutionExist = async (exerciseID: number, potentialSolution: string):Promise<[number, GeneralResponse]> => {
  try {
    let [code, response] = await exerciseController.getExerciseSolutionsByExerciseID(exerciseID);
    if (code !== 200)
      return [code, response];
    for (let solution of response.solutions) {
      if (potentialSolution.toLowerCase() === (solution.query as string).toLowerCase())
        return [200, { message: 'Solution already exists' }];
    }
    return [200, { message: 'Solution does not exist yet' }];
  } catch (e) {
    return [500, { message: 'Unknown error occured while trying to get exercise solutions' }];
  }
}

const editSolutionBeforeSaving = (solution: string) => {
  if(solution.charAt(solution.length - 1) !== ';') solution += ';';
  return solution;
}

const proccessNewSolution = async (exerciseID: number, potentialSolution: string, executionTime: number):Promise<[number, GeneralResponse]> => {
  potentialSolution = editSolutionBeforeSaving(potentialSolution);
  let [code, response] = await checkIfSolutionExist(exerciseID, potentialSolution);
  if (code === 200 && response.message === 'Solution does not exist yet') {
    [code, response] = await insertNewSolution(exerciseID, potentialSolution, executionTime);
  }
  return [code, response];
}

export const getQueryTestResult = async (request: any, reply: any) => {
  const { role, id, exerciseId, queryToExecute, solution } = request.query;
  let [code, response] = await testQueries(role, solution, queryToExecute, 'test');
  // 200 - OK
  // 400 - ERROR query
  // 403 - BAD REQUEST (prazdne query)
  // 500 - chyba s pripojenim na DB

  if (code === 400 || code === 200) {
    let solutionSuccess = code === 400 ? 'ERROR' : response.queriesMatch ? 'PARTIAL' : 'WRONG';
    let [insertCode, insertResponse] = await insertNewAnswer(id, exerciseId, queryToExecute, solutionSuccess, false, response.executionTime);
    if( insertCode !== 200) {
      reply.code(insertCode).send(insertResponse);
      return;
    }
  }
  reply.code(code).send(response);
  return; 
}

export const getQuerySubmitResult = async (request: any, reply: any) => {
  const { role, id, exerciseId, queryToExecute, solution } = request.query;
  let [code, response] = await testQueries(role, solution, queryToExecute, 'test');

  if (code === 400 || code === 200) {
    let solutionSuccess = code === 400 ? 'ERROR' : response.queriesMatch ? 'PARTIAL' : 'WRONG';
    if (code === 200 && response.queriesMatch) {
      let editedSolutionQuery = editQueryToSecondScheme(solution);
      let editedStudentQuery = editQueryToSecondScheme(queryToExecute);
      let [_code, _response] = await testQueries(role, editedSolutionQuery, editedStudentQuery, 'submit');
      if (_code === 500) {
        reply.code(_code).send(_response);
        return;
      } else if (code === 200) {
        solutionSuccess = 'COMPLETE';
        let [processSolutionCode, processSolutionResponse] = await proccessNewSolution(exerciseId, queryToExecute, response.executionTime);
        if (processSolutionCode !== 200) {
          // TODO: solution je spravne, ale nejde ulozit - co s tym chcem spravit? Mozem vytvorit nejaky proces, ktory raz za cas prebehne answers a porovna, ci vsetky success = 'COMPLETE' su aj v users.solutions
          let res = {
            message: 'Solution is correct, but it could not be saved.',
          }
        }
      } else {
        solutionSuccess = 'ERROR';
      }
    }

    // TODO: ak porovnanie nad sekundarnou db = ERROR, potom asi nechcem ulozit response.executionTime (ktory je z porovnania nad primarnou DB)
    // TODO: na druhej strane, userovi ukaze execTime nad primarnou db, ze execTime je X, potom submitne query, a zrazu execTime = iny cas?
    let [insertCode, insertResponse] = await insertNewAnswer(id, exerciseId, queryToExecute, solutionSuccess, true, response.executionTime);
    if( insertCode !== 200) {
      reply.code(insertCode).send(insertResponse);
      return;
    }
  }
  reply.code(code).send(response);
  return; 
}