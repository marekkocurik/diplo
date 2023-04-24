// import { AST } from 'node-sql-parser/build/postgresql';
// import { executeQuery } from '../exercise/exercise';
// import TableController from '../../database/solutionsController';
// import { GeneralResponse } from '../../database/databaseController';

// interface SolutionAttempt {
//   original_query: string;
//   normalized_query: string;
//   ast: AST | null;
// }

// const tableController = new TableController();

// const normalizeStudentQueryAndCreateAST = async (
//   role: string,
//   query: string
// ): Promise<[GeneralResponse, SolutionAttempt]> => {
//   let resp: GeneralResponse = {
//     code: 0,
//     message: ''
//   }
//   let sol: SolutionAttempt = {
//     original_query: query,
//     normalized_query: '',
//     ast: null,
//   };
//   try {
//     let response = await executeQuery(role, query, 'get', 'help');
//     if (queryCode !== 200) {
//       response.message = queryResult.message;
//       return [queryCode, response];
//     }
//     let [normCode, normResult] = await normalizeQuery(query);
//     if (normCode !== 200) {
//       response.message = normResult.message;
//       return [normCode, response];
//     }
//     response.normalized_query = normResult.normalizedQuery;
//     let [astCode, astResult] = await createASTForNormalizedQuery(normResult.normalizedQuery);
//     if (astCode !== 200) {
//       response.message = astResult.message;
//       return [astCode, response];
//     }
//     response.message = 'OK';
//     response.ast = JSON.parse(astResult.ast);
//     return [200, response];
//   } catch (error) {
//     response.message = 'Something went wrong while trying to normalize student query and create representing AST';
//     return [500, response];
//   }
// };

// const getExerciseSolutions = async (exercise_id: number): Promise<[number, SolutionQueriesAndASTResponse]> => {
//   try {
//     let [code, result] = await tableController.getAllExerciseSolutionsByExerciseId(exercise_id);
//     return [code, result];
//   } catch (error) {
//     return [
//       500,
//       {
//         message: 'Something went wrong while trying to receive solutions for exercise id: ' + exercise_id,
//         solutions: [],
//       },
//     ];
//   }
// };

// const prioritizeSolutions = (studentSolution: SolutionQueriesAndAST, solutions: SolutionQueriesAndAST[]): SolutionQueriesAndAST[] => {
//   let newSolutions: SolutionQueriesAndAST[] = [];
//   return newSolutions;
// };

// export const getHelp = async (request: any, reply: any) => {
//   const { role, exerciseId, queryToExecute } = request.query;
//   // role, id
//   let [code, result] = await normalizeStudentQueryAndCreateAST(role, queryToExecute);
//   if (code !== 200) {
//     reply.code(code).send(result);
//     return;
//   }
//   let [solCode, solRes] = await getExerciseSolutions(exerciseId);
//   if (solCode !== 200) {
//     reply.code(solCode).send(solRes);
//     return;
//   }
//   //   console.log('solutions:');
//   //   console.dir(solRes.solutions, { depth: null });
//   let studentSolution: SolutionQueriesAndAST = {
//     id: 0,
//     original_query: queryToExecute,
//     normalized_query: result.normalized_query,
//     ast: JSON.stringify(result.ast)
//   }
//   let solutions = prioritizeSolutions(studentSolution, solRes.solutions);

//   reply
//     .code(200)
//     .send({ message: 'OK', original: result.original_query, normalized: result.normalized_query, ast: result.ast });
//   return;
// };
