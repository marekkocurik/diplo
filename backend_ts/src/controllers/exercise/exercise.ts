import ExerciseController, { ExerciseSolved, ExerciseStarted, TreeExercise } from '../../database/exercisesController';
import { queryToUpperCase } from '../ast/lexicalAnalysis/analyzer';
// import { createASTForNormalizedQuery, normalizeQuery } from '../ast/abstractSyntaxTree';
import { GeneralResponse } from '../../database/databaseController';
import SolutionController from '../../database/solutionsController';
import AnswersController from '../../database/answersController';
import ChaptersController, { TreeChapter } from '../../database/chaptersController';

interface QueryCompareResponse {
  query_result: {};
  execution_time: number;
  solution_success: string;
}

interface QueryExecuteReponse {
  queryResult: object;
  executionTime: number;
}

interface QueryTestResponse extends QueryExecuteReponse {
  queriesMatch: boolean;
}

const exercisesController = new ExerciseController();
const solutionsController = new SolutionController();
const answersController = new AnswersController();
const chaptersController = new ChaptersController();

const queryResultsMatch = (solution_query_result: Object, student_query_result: Object): boolean => {
  if (JSON.stringify(solution_query_result) === JSON.stringify(student_query_result)) return true;
  return false;
};

// export const getExercise = async (request: any, reply: any) => {
//   const { role, id, exerciseId } = request.query;
//   try {
//     let [exercise_code, exercise_response] = await exercisesController.getExerciseByID(exerciseId);
//     if (exercise_code !== 200) {
//       reply.code(exercise_code).send(exercise_response);
//       return;
//     }
//     let [solution_code, solution_response] =
//       await solutionsController.getExerciseExpectedSolutionOriginalQueryByExerciseId(exerciseId);
//     if (solution_code !== 200) {
//       reply.code(solution_code).send(solution_response);
//       return;
//     }
//     let response = {
//       ...exercise_response,
//       solution: solution_response.query,
//     };
//     reply.code(200).send(response);
//     return;
//   } catch (e) {
//     reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise info' });
//     return;
//   }
// };

type ExerciseTreeResponse =
| [GeneralResponse, TreeChapter[]]
| [GeneralResponse, TreeExercise[]]
| [GeneralResponse, ExerciseSolved[]]
| [GeneralResponse, ExerciseStarted[]]

export const getExerciseTree = async (request: any, reply: any) => {
  const { id } = request.query;
  let response: ExerciseTreeResponse;
  try {
    response = await chaptersController.getAllChapters();
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({message: response[0].message});
      return;
    }
    const chapters = response[1] as TreeChapter[];
    let exercise_ids: number[] = [];
    let i = 1;
    for (let chapter of chapters) {
      response = await exercisesController.getTreeExercisesByChapterID(chapter.id);
      if (response[0].code !== 200) {
        reply.code(response[0].code).send({message: response[0].message});
        return;
      }
      const exercises = response[1];
      let j = 1;
      for (let exercise of exercises) {
        exercise._id = j++;
        exercise_ids.push(exercise.id);
      }
      chapter._id = i++;
      chapter.exercises = exercises;
    }
    response = await exercisesController.checkSolvedExercisesById(id);
    if (response[0].code === 200) {
      let exercises_solved = response[1] as ExerciseSolved[];
      console.log(exercises_solved);
      for (let c of chapters) {
        c.solved = true;
        for (let e of c.exercises) {
          let o = exercises_solved.find((item) => item.exercise_id === e.id);
          e.solved = o === undefined? false : true;
          if (c.solved && !e.solved) c.solved = false;
        }
      }
      response = await exercisesController.checkStartedExercisesById(id);
      if (response[0].code === 200) {
        let exercises_started = response[1] as ExerciseStarted[];
        console.log(exercises_started);
        for (let c of chapters) {
          for (let e of c.exercises) {
            let o = exercises_started.find((item) => item.exercise_id === e.id);
            e.started = o === undefined? false : true;
          }
        }
      }
    }
    reply.code(200).send({message: 'OK', chapters});
    return;
  } catch (error) {
    reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise tree' });
    return;
  }
};

export const getExerciseHistory = async (request: any, reply: any) => {
  const { id, exerciseId } = request.query;
  try {
    let response = await answersController.getExerciseAnswersByExerciseIDAndUserID(exerciseId, id);
    reply.code(response[0].code).send({message: response[0].message, answers: response[1]});
    return;
  } catch (e) {
    reply.code(500).send({ message: "Unknown error occured while trying to obtain user's query history for Exercise: " + exerciseId });
    return;
  }
};

export const getUserExerciseSolutions = async (request: any, reply: any) => {
  const { id, exerciseId } = request.query;
  try {
    let response = await answersController.getUserExerciseSolutionsByExerciseID(id, exerciseId);
    reply.code(response[0].code).send({ message: response[0].message, solutions: response[1] });
    return;
  } catch (e) {
    reply
      .code(500)
      .send({
        message: "Unknown error occured while trying to obtain user's solution Answers for Exercise id: " + exerciseId,
      });
    return;
  }
};

// export const executeQuery = async (
//   role: string,
//   query: string,
//   action: string,
//   queryType: string
// ): Promise<[GeneralResponse, QueryExecuteReponse]> => {
//   try {
//     let response = await exercisesController.getQueryResult(role, query);
//     return [code, response];
//   } catch (e) {
//     let response = {
//       message: '',
//       queryResult: {},
//       executionTime: 0,
//     };
//     if (e instanceof Error) {
//       response.message = e.message;
//       return [400, response];
//     } else {
//       response.message = 'Unknown error occured while trying to ' + action + ' ' + queryType + ' query';
//       return [500, response];
//     }
//   }
// };

// const testQueries = async (
//   role: string,
//   solutionQuery: string,
//   studentQuery: string,
//   action: string
// ): Promise<[number, QueryTestResponse]> => {
//   let testResponse = {
//     queriesMatch: false,
//   };
//   let [code, response] = await executeQuery(role, solutionQuery, action, 'solution');
//   if (code !== 200) return [code, Object.assign(testResponse, response)];
//   let solutionResult = response.queryResult;
//   [code, response] = await executeQuery(role, studentQuery, action, 'user');
//   if (code !== 200) return [code, Object.assign(testResponse, response)];
//   let studentResult = response.queryResult;
//   testResponse.queriesMatch = queryResultsMatch(solutionResult, studentResult);
//   return [200, Object.assign(testResponse, response)];
// };

const insertNewSolution = async (
  exerciseID: number,
  original_query: string,
  normalized_query: string,
  ast: string
): Promise<GeneralResponse> => {
  try {
    let response = await solutionsController.insertNewSolution(
      exerciseID,
      original_query,
      normalized_query,
      ast
    );
    return response;
  } catch (error) {
    return {code: 500, message: 'Unknown error occured while trying to insert new solution' };
  }
};

const insertNewAnswer = async (
  users_to_exercises_id: number,
  query: string,
  solutionSuccess: string,
  submitAttempt: boolean,
  executionTime: number
): Promise<GeneralResponse> => {
  try {
    let response = await answersController.insertNewAnswer(
      users_to_exercises_id,
      query,
      solutionSuccess,
      submitAttempt,
      executionTime
    );
    return response;
  } catch (error) {
    return {code:500, message: "Unknow error occured while trying to insert user's answer" };
  }
};

const editQueryToSecondScheme = (query: string) => {
  const regex = /\sCD\./g;
  const replacement = ' CD2.';
  const newQuery = query.replace(regex, replacement);
  return newQuery;
};

const checkIfSolutionExist = async (
  exerciseID: number,
  normalizedPotentialSolution: string
): Promise<GeneralResponse> => {
  try {
    let response = await solutionsController.getAllExerciseSolutionsNormalizedQueryByExerciseId(exerciseID);
    if (response[0].code !== 200) return response[0];
    for (let solution of response[1]) {
      if (normalizedPotentialSolution === solution.normalized_query) {
        console.log('solution already exists: ', solution.normalized_query);
        return { code: 200, message: 'Solution already exists' };
      }
    }
    console.log('solution does not exist yet');
    return { code: 200, message: 'Solution does not exist yet' };
  } catch (error) {
    return {
      code: 500,
      message:
        'Unknown error occured while trying to get all Solutions normalized_query for Exercise id: ' + exerciseID,
    };
  }
};

const editSolutionBeforeSaving = (solution: string) => {
  if (solution.charAt(solution.length - 1) !== ';') solution += ';';
  return solution;
};

// const proccessNewSolution = async (
//   exerciseID: number,
//   potentialSolution: string,
//   executionTime: number
// ): Promise<[number, GeneralResponse]> => {
//   potentialSolution = editSolutionBeforeSaving(potentialSolution);

//   let [normCode, normResult] = await normalizeQuery(potentialSolution);
//   if (normCode !== 200) return [normCode, { message: normResult.message }];
//   // console.log('normalized query: ', normResult.normalizedQuery);

//   let [astCode, astResult] = await createASTForNormalizedQuery(normResult.normalizedQuery);
//   if (astCode !== 200) return [astCode, { message: astResult.message }];
//   // console.log('ast: ');
//   // console.dir(astResult.ast, {depth:null});

//   let [code, response] = await checkIfSolutionExist(exerciseID, normResult.normalizedQuery);
//   if (code === 200 && response.message === 'Solution does not exist yet') {
//     [code, response] = await insertNewSolution(
//       exerciseID,
//       potentialSolution,
//       normResult.normalizedQuery,
//       executionTime,
//       astResult.ast
//     );
//   }
//   return [code, response];
// };

// export const getQueryExpectedResult = async (request: any, reply: any) => {
//   const { role, queryToExecute } = request.query;
//   let [code, response] = await executeQuery(role, queryToExecute, 'get', 'expected');
//   reply.code(code).send(response);
//   return;
// };

// export const getQueryTestResult = async (request: any, reply: any) => {
//   const { role, id, exerciseId, queryToExecute, solution } = request.query;
//   let [code, response] = await testQueries(role, solution, queryToExecute, 'test');
//   // 200 - OK
//   // 400 - ERROR query
//   // 403 - BAD REQUEST (prazdne query)
//   // 500 - chyba s pripojenim na DB
//   let solutionSuccess = 'ERROR';
//   if (code === 400 || code === 200) {
//     solutionSuccess = code === 400 ? 'ERROR' : response.queriesMatch ? 'PARTIAL' : 'WRONG';
//     let [insertCode, insertResponse] = await insertNewAnswer(
//       id,
//       exerciseId,
//       queryToExecute,
//       solutionSuccess,
//       false,
//       response.executionTime
//     );
//     if (insertCode !== 200) {
//       reply.code(insertCode).send(insertResponse);
//       return;
//     }
//   }
//   let res = {
//     ...response,
//     solutionSuccess: solutionSuccess,
//   };
//   reply.code(code).send(res);
//   return;
// };

// export const getQuerySubmitResult = async (request: any, reply: any) => {
//   const { role, id, exerciseId, solution } = request.query;
//   let { queryToExecute } = request.query;
//   queryToExecute = queryToUpperCase(queryToExecute);
//   let [code, response] = await testQueries(role, solution, queryToExecute, 'test');
//   let solutionSuccess = 'ERROR';
//   if (code === 400 || code === 200) {
//     solutionSuccess = code === 400 ? 'ERROR' : response.queriesMatch ? 'PARTIAL' : 'WRONG';
//     if (code === 200 && response.queriesMatch) {
//       let editedSolutionQuery = editQueryToSecondScheme(solution);
//       let editedStudentQuery = editQueryToSecondScheme(queryToExecute);
//       let [_code, _response] = await testQueries(role, editedSolutionQuery, editedStudentQuery, 'submit');
//       if (_code === 500) {
//         reply.code(_code).send(_response);
//         return;
//       } else if (code === 200) {
//         solutionSuccess = 'COMPLETE';
//         console.log('processing new solution');
//         let [processSolutionCode, processSolutionResponse] = await proccessNewSolution(
//           exerciseId,
//           queryToExecute,
//           response.executionTime
//         );
//         if (processSolutionCode !== 200) {
//           // TODO: user case: solution je spravne, ale nejde ulozit - co s tym chcem spravit? Mozem vytvorit nejaky proces, ktory raz za cas prebehne answers a porovna, ci vsetky success = 'COMPLETE' su aj v users.solutions
//           let res = {
//             message: 'Solution is correct, but it could not be saved.',
//           };
//         }
//       } else {
//         solutionSuccess = 'ERROR';
//       }
//     }

//     // TODO: ak porovnanie nad sekundarnou db = ERROR, potom asi nechcem ulozit response.executionTime (ktory je z porovnania nad primarnou DB)
//     // TODO: na druhej strane, userovi ukaze execTime nad primarnou db, ze execTime je X, potom submitne query, a zrazu execTime = iny cas?
//     let [insertCode, insertResponse] = await insertNewAnswer(
//       id,
//       exerciseId,
//       queryToExecute,
//       solutionSuccess,
//       true,
//       response.executionTime
//     );
//     if (insertCode !== 200) {
//       reply.code(insertCode).send(insertResponse);
//       return;
//     }
//   }
//   let res = {
//     ...response,
//     solutionSuccess: solutionSuccess,
//   };
//   reply.code(code).send(res);
//   return;
// };
