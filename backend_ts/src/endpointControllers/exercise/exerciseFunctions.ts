import DatabaseController, { GeneralResponse, QueryResult } from '../../databaseControllers/databaseController';
import ExerciseController from '../../databaseControllers/exercisesController';
import { ASTObject, normalizeQuery } from '../ast/lexicalAnalysis/analyzer';
import SolutionController from '../../databaseControllers/solutionsController';
import AnswersController from '../../databaseControllers/answersController';
import ChaptersController from '../../databaseControllers/chaptersController';
import UsersToExercisesController from '../../databaseControllers/usersToExercisesController';
import { createASTForQuery } from '../ast/abstractSyntaxTree';
import { AST } from 'node-sql-parser/build/postgresql';
const hash = require('object-hash');

export interface QueryTestResponse extends QueryResult {
  queriesResultsMatch: boolean;
}

export const databaseController = new DatabaseController();
export const exercisesController = new ExerciseController();
export const solutionsController = new SolutionController();
export const answersController = new AnswersController();
export const chaptersController = new ChaptersController();
export const usersToExercisesController = new UsersToExercisesController();

type ProcessNewSolutionResponse = [GeneralResponse, string] | [GeneralResponse, AST | null] | GeneralResponse;

export const queryResultsMatch = (solution_query_result: Object, student_query_result: Object): boolean => {
  // const stud_hash = hash(student_query_result);
  // const sol_
  // if (JSON.stringify(solution_query_result) === JSON.stringify(student_query_result)) return true;
  console.log(student_query_result);
  console.log(typeof student_query_result);
  console.log(hash(student_query_result));
  console.log(hash(solution_query_result));
  return hash(student_query_result) === hash(solution_query_result);
};

export const executeQuery = async (
  role: string,
  query: string,
  action: string,
  queryType: string
): Promise<[GeneralResponse, QueryResult]> => {
  try {
    let response = await exercisesController.getQueryResult(role, query);
    return response;
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

const executeNonSelectQuery = async (
  role: string,
  query: string,
  table: string
): Promise<[GeneralResponse, { queryResult: object }]> => {
  try {
    let result = await exercisesController.getNonSelectQueryResult(role, query, table);
    return result;
  } catch (error) {
    return [
      { code: 500, message: 'Something went wrong while trying to execute INSERT/UPDATE/DELETE query' },
      { queryResult: [] },
    ];
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
  const solutionResult = response[1] as QueryResult;
  response = await executeQuery(role, studentQuery, action, 'user');
  if (response[0].code !== 200) return [response[0], Object.assign(testResponse, response[1])];
  const studentResult = response[1] as QueryResult;

  const stud_ast = createASTForQuery(studentQuery)[1];
  const sol_ast = createASTForQuery(solutionQuery)[1];

  if (sol_ast !== null && sol_ast.type !== 'select') {
    console.log('query nie je select');
    if (stud_ast !== null && stud_ast.type === sol_ast.type) {
      const sol_table = getNonSelectQueryTable(sol_ast) as string;
      const stud_table = getNonSelectQueryTable(stud_ast) as string;
      const sol_select = await executeNonSelectQuery(role, solutionQuery, sol_table);
      const stud_select = await executeNonSelectQuery(role, studentQuery, stud_table);
      console.log(sol_table, stud_table);
      console.log(sol_select);
      console.log(stud_select);
      if (sol_select[0].code !== 200 || stud_select[0].code !== 200) {
        console.log('returning here 1')
        return [
          { code: 500, message: 'Internal error: failed to evaluate correctness of a query' },
          Object.assign({ queriesResultsMatch: false }, studentResult),
        ];
      } else {
        console.log('returning here 2')
        let match = queryResultsMatch(sol_select[1].queryResult, stud_select[1].queryResult);
        return [{ code: 200, message: 'OK' }, Object.assign({ queriesResultsMatch: match }, studentResult)];
      }
    } else {
      console.log('returning here 3')
      return [{ code: 200, message: 'OK' }, Object.assign({ queriesResultsMatch: false }, studentResult)];
    }
  } else {
    console.log('query je select');
    testResponse.queriesResultsMatch = queryResultsMatch(solutionResult.queryResult, studentResult.queryResult);
    return [{ code: 200, message: 'OK' }, Object.assign(testResponse, studentResult)];
  }
};

const getNonSelectQueryTable = (ast: ASTObject): string | undefined => {
  let s: string | undefined;
  if ('table' in ast && ast.table !== null) {
    if (Array.isArray(ast.table) && ast.table.length > 0) {
      return ast.table[0].table;
    } else {
      return ast.table;
    }
  }
  return s;
};

export const updateUsersToExerciseToSolved = async (user_id: number, exercise_id: number): Promise<GeneralResponse> => {
  try {
    let response = await usersToExercisesController.updateToSolved(user_id, exercise_id);
    return response;
  } catch (error) {
    return {
      code: 500,
      message:
        'Unknown error occured while trying to update users_to_exercise to solved for user_id ' +
        user_id +
        ', exercise_id ' +
        exercise_id,
    };
  }
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
          'Unknown error occured while trying to get users_to_exercises info: user_id ' +
          user_id +
          ', exercise_id ' +
          exercise_id,
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
    let normalizedPotentialSolutionNoSpaces = normalizedPotentialSolution.replace(/\s+/g,'');
    for (let solution of response[1]) {
      let solutionNoSpaces = solution.normalized_query.replace(/\s+/g,'');
      // console.log('already known sol: ', solution.normalized_query);
      if (normalizedPotentialSolutionNoSpaces === solutionNoSpaces) {
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

export const proccessNewSolution = async (exercise_id: number, potentialSolution: string): Promise<GeneralResponse> => {
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
