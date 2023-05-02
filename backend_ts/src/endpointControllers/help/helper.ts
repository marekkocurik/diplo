import { AST, Select } from 'node-sql-parser/build/postgresql';
import { executeQuery, solutionsController } from '../exercise/exerciseFunctions';
import { Solution } from '../../databaseControllers/solutionsController';
import { GeneralResponse, QueryResult } from '../../databaseControllers/databaseController';
import { ASTObject, normalizeQuery } from '../ast/lexicalAnalysis/analyzer';
import { createASTForQuery } from '../ast/abstractSyntaxTree';
import { compareQueryASTS } from '../ast/lexicalAnalysis/comparator';

interface SolutionAttempt {
  original_query: string;
  normalized_query: string;
  ast: AST;
}

type NormalizeStudentQueryAndCreateASTResponse =
  | [GeneralResponse, QueryResult]
  | [GeneralResponse, string]
  | [GeneralResponse, AST | null];

type GetHelpResposne = [GeneralResponse, SolutionAttempt] | [GeneralResponse, Solution[]];

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
  const { role, exerciseId, queryToExecute } = request.query;
  // const user_id = request.query.id;
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
  const exerciseSolutions = response[1] as Solution[];
  let prioritizedExerciseSolutions = prioritizeSolutions(solAttempt, exerciseSolutions);
//   console.log(prioritizedExerciseSolutions[0].original_query);
//   console.log(prioritizedExerciseSolutions[1].original_query);

  // porovnanie studentovho AST s prvym AST z prioritizovanych solutions
  compareQueryASTS(solAttempt.ast, JSON.parse(prioritizedExerciseSolutions[0].ast));

  reply.code(200).send({ message: 'OK', solAttempt });
  return;
};
