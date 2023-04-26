import { AST, Select, Insert_Replace } from 'node-sql-parser/build/postgresql';
import { ASTObject } from './analyzer';
const { Parser } = require('node-sql-parser/build/postgresql');

const parser = new Parser();
const opt = { database: 'PostgresQL' };

const sortSelectClause = (ast: Select) => {
  let arr: string[] = [];
  let cols: any[] = [];
  if (ast.columns !== null) {
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
    ast.columns = cols;
  }
};

const sortFromClause = (ast: Select) => {
  /**
   * 1. FROM
   * 2. FROM JOIN JOIN
   * 3. FROM SELECT JOIN JOIN
   * 4. FROM JOIN SELECT JOIN
   */

  let arr: String[] = [];
  let tmp: any[] = [];
  if (ast.from !== null) {
    if (ast.from.length > 1) {
      for (let o of ast.from) if (!isSubAst(o)) arr.push(o.table); // sortnem len to co nie je AST
      arr = arr.sort();
      for (let a of arr) {
        // sortnem tie veci co su v arr
        let occurencies = 1;
        for (let o of ast.from) if (!isSubAst(o) && o.table === a) occurencies++;
        if (occurencies === 1) {
          tmp.push(ast.from.find((obj) => obj.table === a));
        } else {
          let i = 0;
          for (let o of ast.from) {
            if (i === occurencies) break;

          }
        }
      }

      for (let o of tmp) { // usporiadanie left a right vetvy v pripade join
        // let o = ast.from.find((obj) => obj.table === a);
        //   if (o !== null) {
        //     if (o.join === null) {
        //       tmp.push(o);
        //     } else {
        //       let arr2 = [o.on.left.table, o.on.right.table].sort();
        //       let tmp2: {} = o.on.left.table === arr2[0] ? o.on.left : o.on.right;
        //     }
        //   }
      }

      for (let o of ast.from) if (isSubAst(o)) tmp.push(o);
      ast.from = tmp;
    }
  }
};

const sortWhereClause = (ast: Select) => {
  if (ast.where !== null) {

  }
}

const sortInsertClause = (ast: Insert_Replace) => {
  if (ast.columns !== null) {
    ast.columns = ast.columns.sort();
  }
};

const sortAST = (ast: AST) => {
  if (ast.type === 'select') {
    sortSelectClause(ast);
    // sortFromClause(ast);
    // sortWhereClause(ast);
    // sortGroupByClause(ast);
    // sortHavingClause(ast);
    // sortOrderByClause(ast);
  } else if (ast.type === 'insert') {
    sortInsertClause(ast);
  } else if (ast.type === 'delete') {
  } else if (ast.type === 'update') {
  }
  // findSubAST(ast);
};

const isSubAst = (value: any): value is AST => {
  return typeof value === 'object' && 'ast' in value;
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

export const sortASTAlphabetically = (ast: AST) => {
  // let ast2 = parser.astify(query, opt);
  if (Array.isArray(ast)) ast = ast[0];
  // if (Array.isArray(ast2)) ast2 = ast2[0];
    // console.dir(ast, { depth: null });
  sortAST(ast);
  findSubAST(ast);
  // if (JSON.stringify(ast) === JSON.stringify(ast2)) console.log(true);
  // else {
  //   console.dir(ast2, { depth: null });
  //   console.dir(ast, { depth: null });
  // }
  // return ast;
};
