import { AST, Select } from 'node-sql-parser/build/postgresql';
import { executeQuery, solutionsController, usersToExercisesController } from '../exercise/exerciseFunctions';
import { Solution } from '../../databaseControllers/solutionsController';
import { GeneralResponse, QueryResult } from '../../databaseControllers/databaseController';
import { ASTObject, normalizeQuery } from '../ast/lexicalAnalysis/analyzer';
import { createASTForQuery } from '../ast/abstractSyntaxTree';
import { compareQueryASTS } from '../ast/lexicalAnalysis/comparator';
import { createRecommendations, getRecommendationId, insertRecommendations, ratingsController, updateRecommendationRatingById, updateRecommendationVisitedById } from '../recommendations/recommender';

interface SolutionAttempt {
  original_query: string;
  normalized_query: string;
  ast: AST;
}

type NormalizeStudentQueryAndCreateASTResponse =
  | [GeneralResponse, QueryResult]
  | [GeneralResponse, string]
  | [GeneralResponse, AST | null];

type GetHelpResposne =
  | [GeneralResponse, SolutionAttempt]
  | [GeneralResponse, Solution[]]
  | [GeneralResponse, ASTObject, ASTObject]
  | [GeneralResponse, number | undefined]
  | GeneralResponse;

const normalizeStudentQueryAndCreateAST = async (
  role: string,
  query: string
): Promise<[GeneralResponse, SolutionAttempt]> => {
  let sol: SolutionAttempt = {
    original_query: query,
    normalized_query: '',
    ast: { type: 'use', db: '' },
  };
  let response: NormalizeStudentQueryAndCreateASTResponse;
  response = await executeQuery(role, query, 'get', 'help');
  if (response[0].code !== 200) return [response[0], sol];
  response = await normalizeQuery(query);
  if (response[0].code !== 200) return [response[0], sol];
  sol.normalized_query = response[1] as string;
  response = await createASTForQuery(sol.normalized_query);
  if (response[0].code !== 200) return [response[0], sol];
  sol.ast = response[1] as AST;
  return [response[0], sol];
};

const getExerciseSolutions = async (exercise_id: number): Promise<[GeneralResponse, Solution[]]> => {
  try {
    let [code, result] = await solutionsController.getAllExerciseSolutionsByExerciseId(exercise_id);
    return [code, result];
  } catch (error) {
    return [
      { code: 500, message: 'Something went wrong while trying to receive solutions for exercise id: ' + exercise_id },
      [],
    ];
  }
};

const hasSubAst = (value: any): value is AST => {
  return typeof value === 'object' && 'ast' in value;
};

const findSubAST = (obj: ASTObject): boolean => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        if (hasSubAst(obj[i]) || findSubAST(obj[i])) return true;
      }
    }
    return false;
  } else {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (hasSubAst(obj[key]) || findSubAST(obj[key])) return true;
      }
    }
    return false;
  }
};

// const findSubAST = (obj: ASTObject): boolean => {
//     console.log('Starting the search for obj:');
//     console.log(obj);
//   if (Array.isArray(obj)) {
//     console.log('Obj is ARRAY');
//     for (let i = 0; i < obj.length; i++) {
//       if (typeof obj[i] === 'object' && obj[i] !== null) {
//         // if (isSubAst(obj[i]) || findSubAST(obj[i])) return true;
//         if (isSubAst(obj[i])) {
//             console.log('FOUND SUB AST AND RETURNING TRUE');
//             return true;
//         }
//         console.log('GOING DEEPER');
//         if(findSubAST(obj[i])) {
//             console.log('RETURNING TRUE');
//             return true;
//         }
//       }
//     }
//     console.log('RETURNING FALSE');
//     return false;
//   } else {
//     console.log('Obj is NOT ARRAY');
//     for (let key in obj) {
//       if (typeof obj[key] === 'object' && obj[key] !== null) {
//         // if (isSubAst(obj[key]) || findSubAST(obj[key])) return true;
//         if (isSubAst(obj[key])) {
//             console.log('FOUND SUB AST AND RETURNING TRUE');
//             return true;
//         }
//         console.log('GOING DEEPER');
//         if(findSubAST(obj[key])) {
//             console.log('RETURNING TRUE');
//             return true;
//         }
//       }
//     }
//     console.log('RETURNING FALSE');
//     return false;
//   }
// };

const selectHasSubquery = (ast: Select): string => {
  if (ast.columns !== null && ast.columns !== '*' && findSubAST(ast.columns)) return 'select';
  else if (ast.from !== null && findSubAST(ast.from)) return 'from';
  else if (ast.where !== null && findSubAST(ast.where)) return 'where';
  else if (ast.having !== null && findSubAST(ast.having)) return 'having';
  else return '';
};

const prioritizeSolutions = (studentSolution: SolutionAttempt, exerciseSolutions: Solution[]): Solution[] => {
  let solsWithSubQueryInSameBranch: Solution[] = [];
  let solsWithSubQuery: Solution[] = [];
  let solsWithoutSubQuery: Solution[] = [];
  let prioritized: Solution[] = [];
  if (studentSolution.ast.type === 'select') {
    const branch = selectHasSubquery(studentSolution.ast);
    if (branch !== '') {
      for (let s of exerciseSolutions) {
        let sBranch = selectHasSubquery(JSON.parse(s.ast));
        if (sBranch === branch) solsWithSubQueryInSameBranch.push(s);
        else if (sBranch !== '') solsWithSubQuery.push(s);
        else solsWithoutSubQuery.push(s);
      }
      prioritized.push(...solsWithSubQueryInSameBranch, ...solsWithSubQuery, ...solsWithoutSubQuery);
    } else {
      for (let s of exerciseSolutions) {
        let sBranch = selectHasSubquery(JSON.parse(s.ast));
        if (sBranch === '') solsWithoutSubQuery.push(s);
        else solsWithSubQuery.push(s);
      }
      prioritized.push(...solsWithoutSubQuery, ...solsWithSubQuery);
    }
  } else {
    if (findSubAST(studentSolution.ast)) {
      for (let s of exerciseSolutions) {
        if (findSubAST(JSON.parse(s.ast))) solsWithSubQuery.push(s);
        else solsWithoutSubQuery.push(s);
      }
      prioritized.push(...solsWithSubQuery, ...solsWithoutSubQuery);
    } else {
      for (let s of exerciseSolutions) {
        if (!findSubAST(JSON.parse(s.ast))) solsWithoutSubQuery.push(s);
        else solsWithSubQuery.push(s);
      }
      prioritized.push(...solsWithoutSubQuery, ...solsWithSubQuery);
    }
  }
  return prioritized;
};

export const getHelp = async (request: any, reply: any) => {
  const { role, cluster, exerciseId, queryToExecute } = request.query;
  const user_id = request.query.id;

  let response: GetHelpResposne;
  response = await normalizeStudentQueryAndCreateAST(role, queryToExecute);
  if (response[0].code !== 200) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }

  const solAttempt = response[1] as SolutionAttempt;
  response = await getExerciseSolutions(exerciseId);
  if (response[0].code !== 200) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  // console.log('calling done');
  const exerciseSolutions = response[1] as Solution[];
  let prioritizedExerciseSolutions = prioritizeSolutions(solAttempt, exerciseSolutions);

  // console.log('Selected solution AST:');
  // console.dir(JSON.parse(prioritizedExerciseSolutions[0].ast), {depth:null});

  // console.log('User query AST:');
  // const x = createASTForQuery(queryToExecute);
  // console.dir(x, { depth: null });

  // console.log('User query AST normalized:');
  // const xx = (await normalizeStudentQueryAndCreateAST(role, queryToExecute))[1].ast;
  // console.dir(xx, { depth: null });

  // porovnanie studentovho AST s prvym AST z prioritizovanych solutions

  response = compareQueryASTS(solAttempt.ast, JSON.parse(prioritizedExerciseSolutions[0].ast));
  if (response[0].code !== 200) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  const missing = response[1] as ASTObject;
  const extras = response[2] as ASTObject;
  const recs = createRecommendations(JSON.parse(prioritizedExerciseSolutions[0].ast).type, missing, extras, cluster);

  if (recs.recommendations.length > 0) {
    response = await usersToExercisesController.getIdByUserIdAndExerciseId(user_id, exerciseId);
    if (response[0].code !== 200) {
      console.log('FAILED TO GET users.users_to_exercises id');
    }
    let ute_id = response[1];
    if (ute_id === undefined) {
      response = await usersToExercisesController.insertReturningId(user_id, exerciseId);
      if (response[0].code !== 200) {
        console.log('FAILED TO INSERT NEW RECORD INTO users.users_to_exercises');
      } 
      ute_id = response[1] as number;
    }
    response = await insertRecommendations(recs, ute_id);
    if (response.code !== 200) {
      console.log('FAILED TO INSERT RECOMMENDATIONS INTO users.ratings');
    } else console.log('INSERT SUCCESSFULL');
  } else console.log('NO RECOMMENDATIONS');

  reply.code(200).send({ message: 'OK', recs });
  return;
};

type UpdateRecommendationVisitedResponse = [GeneralResponse, number | undefined] | [GeneralResponse, number] | GeneralResponse; 

export const updateRecommendationVisited = async (request: any, reply: any) => {
  const { exerciseId, recommendation } = request.query;
  const user_id = request.query.id;
  let response: UpdateRecommendationVisitedResponse;
  response = await usersToExercisesController.getIdByUserIdAndExerciseId(user_id, exerciseId);
  if (response[0].code !== 200) {
    console.log('Failed to get users_to_exercises_id to update recommendation to visited');
    return;
  }
  const ute = response[1] as number;
  response = await getRecommendationId(ute, recommendation);
  if (response[0].code !== 200) {
    console.log('Failed to update recommendation to visited');
    return;
  }
  const recomm_id = response[1] as number;
  response = await updateRecommendationVisitedById(recomm_id);
  if (response.code !== 200) {
    console.log('Failed to update recommendation to visited');
    return;
  }
  reply.code(200).send({message: 'OK'});
}

type UpdateRecommendationRatingResponse = [GeneralResponse, number | undefined] | GeneralResponse;

export const updateRecommendationRating = async (request: any, reply: any) => {
  const { exerciseId, recommendation, rating } = request.query;
  const user_id = request.query.id;
  let response: UpdateRecommendationRatingResponse;
  response = await usersToExercisesController.getIdByUserIdAndExerciseId(user_id, exerciseId);
  if (response[0].code !== 200) {
    console.log('Failed to get users_to_exercises_id to update recommendation to visited');
    return;
  }
  const ute = response[1] as number;
  response = await getRecommendationId(ute, recommendation);
  if (response[0].code !== 200) {
    console.log('Failed to update recommendation to visited');
    return;
  }
  const rec_id = response[1] as number;
  response = await updateRecommendationRatingById(rec_id, rating);
  if (response.code !== 200) {
    console.log('Failed to update recommendation rating');
    return;
  }
  reply.code(200).send({message: 'OK'});
}
