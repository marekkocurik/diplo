import { AST } from 'node-sql-parser/build/postgresql';
import { ASTObject } from './analyzer';
const { Parser } = require('node-sql-parser/build/postgresql');

const parser = new Parser();
const opt = { database: 'PostgresQL' };

const sortIfSelectOrInsert = (ast: AST) => {
  let arr: string[] = [];
  let cols: any[] = [];
  if (ast.type === 'select' && ast.columns !== null) {
    console.log('changing select.columns');
    for (let o of ast.columns) {
      if (o.expr.type === 'column_ref') {
        if (o.expr.table === null || o.expr.table === undefined || o.expr.table === '') arr.push(o.expr.column);
        else arr.push(o.expr.table + '.' + o.expr.column);
      }
    }
    arr = arr.sort();
    for (let a of arr) {
      let c = (a as string).includes('.') ? (a as string).split('.')[1] : a;
      let t = (a as string).includes('.') ? (a as string).split('.')[0] : null;
      for (let o of ast.columns) {
        if (o.expr.type === 'column_ref') {
          if (t !== null) {
            if (t === o.expr.table && c === o.expr.column) {
              cols.push(o);
              break;
            }
          } else {
            if ((o.expr.table === null || o.expr.table === undefined || o.expr.table === '') && o.expr.column === c) {
              cols.push(o);
              break;
            }
          }
        }
      }
    }
    for (let o of ast.columns) {
      if (!cols.find((obj) => obj.expr.table === o.expr.table && obj.expr.column === o.expr.column)) cols.push(o);
    }
    // console.log(ast.columns);
    // console.log('...');
    // console.log(cols);
    ast.columns = cols;
  } else if (ast.type === 'insert' && ast.columns !== null) {
    console.log('changing insert.columns');
    ast.columns = ast.columns.sort();
  }
};

const isSubAst = (value: any): value is AST => {
  return typeof value === 'object' && 'ast' in value;
};

const sortAST = (ast: AST) => {
  sortIfSelectOrInsert(ast);
  // findSubAST(ast);
};

const findSubAST = (obj: ASTObject) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (isSubAst(obj[key])) {
        // console.log('found some sub AST');
        // console.dir(obj[key], { depth: null });
        sortAST(obj[key].ast);
      }
      findSubAST(obj[key]);
    }
  }
};

export const sortQueryAlphabetically = (query: string): string => {
  let ast = parser.astify(query, opt);
  let ast2 = parser.astify(query, opt);
  if (Array.isArray(ast)) ast = ast[0];
  if (Array.isArray(ast2)) ast2 = ast2[0];
  //   console.dir(ast, { depth: null });
  sortAST(ast);
  findSubAST(ast);
  //   console.dir(ast.columns, { depth: null });
  //   ast[0].columns = [{type:'expr', expr: {type:'column_ref', table:'table', column:'column'}}]
  //   console.dir(ast, {depth:null});
  //   sortIfSelectOrInsert(ast);
  //   console.dir(ast.columns, { depth: null });
  if (JSON.stringify(ast) === JSON.stringify(ast2)) console.log(true);
  else {
    console.dir(ast2, { depth: null });
    console.dir(ast, { depth: null });
  }
  return query;
};
