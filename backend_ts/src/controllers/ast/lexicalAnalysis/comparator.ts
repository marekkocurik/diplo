import { AST, Select, Insert_Replace } from 'node-sql-parser/build/postgresql';
import { ASTObject } from './analyzer';
const { Parser } = require('node-sql-parser/build/postgresql');

const parser = new Parser();
const opt = { database: 'PostgresQL' };

export const compareQueryASTS = (studentQuery: string, solutionQuery: string): string => {
  let ast_stu = parser.astify(studentQuery, opt);
  let ast_sol = parser.astify(solutionQuery, opt);
  if (Array.isArray(ast_stu)) ast_stu = ast_stu[0];
  if (Array.isArray(ast_sol)) ast_sol = ast_sol[0];

  // if (JSON.stringify(ast) === JSON.stringify(ast2)) console.log(true);
  // else {
  //   console.dir(ast2, { depth: null });
  //   console.dir(ast, { depth: null });
  // }
  return '';
};
