import { GeneralResponse, QueryResult } from '../../databaseControllers/databaseController';
import ExerciseController from '../../databaseControllers/exercisesController';
import { normalizeQuery } from '../ast/lexicalAnalysis/analyzer';
import SolutionController from '../../databaseControllers/solutionsController';
import AnswersController from '../../databaseControllers/answersController';
import ChaptersController from '../../databaseControllers/chaptersController';
import UsersToExercisesController from '../../databaseControllers/usersToExercisesController';
import { createASTForQuery } from '../ast/abstractSyntaxTree';
import { AST } from 'node-sql-parser/build/postgresql';

export interface QueryTestResponse extends QueryResult {
  queriesResultsMatch: boolean;
}

export const exercisesController = new ExerciseController();
export const solutionsController = new SolutionController();
export const answersController = new AnswersController();
export const chaptersController = new ChaptersController();
export const usersToExercisesController = new UsersToExercisesController();

type ProcessNewSolutionResponse =
| [GeneralResponse, string]
| [GeneralResponse, AST | null]
| GeneralResponse

export const queryResultsMatch = (solution_query_result: Object, student_query_result: Object): boolean => {
  if (JSON.stringify(solution_query_result) === JSON.stringify(student_query_result)) return true;
  return false;
};

export const executeQuery = async (
  role: string,
  query: string,
  action: string,
  queryType: string
): Promise<[GeneralResponse, QueryResult]> => {
  try {
    let response = await exercisesController.getQueryResult(role, query);
    return [response[0], response[1]];
  } catch (error) {
    let response: GeneralResponse = { code: 0, message: '' };
    if (error instanceof Error) {
      response.code = 400;
      response.message = error.message;
      return [response, { queryResult: {}, executionTime: 0 }];
    } else {
      response.code = 500;
      response.message = 'Unknown error occured while trying to ' + action + ' ' + queryType + ' query';
      return [response, { queryResult: {}, executionTime: 0 }];
    }
  }
};

export const testQueries = async (
  role: string,
  solutionQuery: string,
  studentQuery: string,
  action: string
): Promise<[GeneralResponse, QueryTestResponse]> => {
  let testResponse = {
    queriesResultsMatch: false,
  };
  let response = await executeQuery(role, solutionQuery, action, 'solution');
  if (response[0].code !== 200) return [response[0], Object.assign(testResponse, response[1])];
  let solutionResult = response[1].queryResult;
  response = await executeQuery(role, studentQuery, action, 'user');
  if (response[0].code !== 200) return [response[0], Object.assign(testResponse, response[1])];
  let studentResult = response[1].queryResult;
  testResponse.queriesResultsMatch = queryResultsMatch(solutionResult, studentResult);
  return [{ code: 200, message: 'OK' }, Object.assign(testResponse, response[1])];
};

export const getUsersToExercisesId = async (
  user_id: number,
  exercise_id: number
): Promise<[GeneralResponse, number | undefined]> => {
  try {
    let response = await usersToExercisesController.getIdByUserIdAndExerciseId(user_id, exercise_id);
    return [response[0], response[1]];
  } catch (error) {
    return [
      {
        code: 500,
        message:
          'Unknown error occured while trying to get users_to_exercises info: uid ' + user_id + ', eid ' + exercise_id,
      },
      undefined,
    ];
  }
};

export const insertNewUsersToExercisesReturningId = async (
  user_id: number,
  exercise_id: number
): Promise<[GeneralResponse, number]> => {
  try {
    let response = await usersToExercisesController.insertReturningId(user_id, exercise_id);
    return [response[0], response[1]];
  } catch (error) {
    return [
      {
        code: 500,
        message:
          'Unknown error occured while trying to insert new users_to_exercises for user_id: ' +
          user_id +
          ', exercise_id: ' +
          exercise_id,
      },
      -1,
    ];
  }
};

export const insertNewAnswerReturningId = async (
  users_to_exercises_id: number,
  query: string,
  solution_success: string,
  submit_attempt: boolean,
  execution_time: number
): Promise<[GeneralResponse, number]> => {
  try {
    let response = await answersController.insertReturningId(
      users_to_exercises_id,
      query,
      solution_success,
      submit_attempt,
      execution_time
    );
    return response;
  } catch (error) {
    return [{ code: 500, message: "Unknow error occured while trying to insert user's answer" }, -1];
  }
};

export const processNewAnswerReturningId = async (
  user_id: number,
  exercise_id: number,
  query: string,
  solution_success: string,
  submit_attempt: boolean,
  execution_time: number
): Promise<[GeneralResponse, number]> => {
  let response: [GeneralResponse, number | undefined];
  response = await getUsersToExercisesId(user_id, exercise_id);
  if (response[0].code !== 200) return [response[0], -1];
  if (response[1] === undefined) {
    response = await insertNewUsersToExercisesReturningId(user_id, exercise_id);
    if (response[0].code !== 200) return response as [GeneralResponse, number];
  }
  const ute_id = response[1] as number;
  response = await insertNewAnswerReturningId(ute_id, query, solution_success, submit_attempt, execution_time);
  return response as [GeneralResponse, number];
};

export const insertNewSolution = async (
  exerciseID: number,
  original_query: string,
  normalized_query: string,
  ast: string
): Promise<GeneralResponse> => {
  try {
    let response = await solutionsController.insert(exerciseID, original_query, normalized_query, ast);
    return response;
  } catch (error) {
    return { code: 500, message: 'Unknown error occured while trying to insert new solution' };
  }
};

export const editQueryToSecondScheme = (query: string): string => {
  const regex = /\sCD\./gi;
  const replacement = ' CD2.';
  const newQuery = query.replace(regex, replacement);
  return newQuery;
};

export const checkIfSolutionExist = async (
  exerciseID: number,
  normalizedPotentialSolution: string
): Promise<GeneralResponse> => {
  try {
    let response = await solutionsController.getAllExerciseSolutionsNormalizedQueryByExerciseId(exerciseID);
    if (response[0].code !== 200) return response[0];
    // console.log('new pot sol: ', normalizedPotentialSolution)
    for (let solution of response[1]) {
        // console.log('already known sol: ', solution.normalized_query);
      if (normalizedPotentialSolution === solution.normalized_query) {
        // console.log('solution already exists: ', solution.normalized_query);
        return { code: 200, message: 'Solution already exists' };
      }
    }
    // console.log('solution does not exist yet');
    return { code: 200, message: 'Solution does not exist yet' };
  } catch (error) {
    return {
      code: 500,
      message:
        'Unknown error occured while trying to get all Solutions normalized_query for Exercise id: ' + exerciseID,
    };
  }
};

export const editSolutionBeforeSaving = (solution: string): string => {
  if (solution.charAt(solution.length - 1) !== ';') solution += ';';
  return solution;
};

export const proccessNewSolution = async (
  exercise_id: number,
  potentialSolution: string
): Promise<GeneralResponse> => {
  potentialSolution = editSolutionBeforeSaving(potentialSolution);
  let response: ProcessNewSolutionResponse;

  response = await normalizeQuery(potentialSolution);
  if (response[0].code !== 200) return response[0];
  const normalizedPotentialSolution = response[1];
  response = createASTForQuery(response[1]);
  if (response[0].code !== 200) return response[0];
  const ast = response[1] as AST;
  response = await checkIfSolutionExist(exercise_id, normalizedPotentialSolution);
  if (response.code === 200 && response.message === 'Solution does not exist yet') {
    response = await insertNewSolution(
        exercise_id,
        potentialSolution,
        normalizedPotentialSolution,
        JSON.stringify(ast)
      );
  }
  return response;
};
