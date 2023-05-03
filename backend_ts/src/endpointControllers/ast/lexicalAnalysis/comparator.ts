import { AST } from 'node-sql-parser/build/postgresql';
import { ASTObject } from './analyzer';
import { GeneralResponse } from '../../../databaseControllers/databaseController';

const diffObjects = (obj1: ASTObject, obj2: ASTObject, parent: string | undefined): ASTObject => {
  let result: ASTObject = {};
  for (let [key, value1] of Object.entries(obj1)) {
    // console.log('parent:',parent,'key:',key);
    const value2 = obj2[key];
    if (value1 !== null) {
      //console.log('checking:', key, ':', value1);
      if (parent === 'ast' && key === 'type') result[key] = value1;
      else if (value2 === undefined || value2 === null) {
        result[key] = value1;
      } else if (typeof value1 !== typeof value2) {
        result[key] = value1;
      } else if (typeof value1 !== 'object') {
        if (value1 !== value2) result[key] = value1;
      } else if (Array.isArray(value1)) {
        if (!Array.isArray(value2)) {
          result[key] = value1;
        } else {
          const diff = diffArrays(value1, value2);
          if (Object.keys(diff).length > 0) {
            result[key] = diff;
          }
        }
      } else {
        const diff = diffObjects(value1, value2, key);
        if (Object.keys(diff).length > 0) {
          result[key] = diff;
        }
      }
    } //else console.log('skipping:', key, ':', value1);
  }
  return result;
};

const isSubQuery = (value: any): value is AST => {
  if (typeof value === 'object' && 'expr' in value && 'ast' in value['expr']) return true;
  else return false;
};

const getSubAST = (ast: ASTObject): ASTObject => {
  if (typeof ast === 'object' && 'expr' in ast && 'ast' in ast['expr']) return ast['expr']['ast'];
  return {};
};

const diffArrays = (arr1: ASTObject[], arr2: ASTObject[]): ASTObject => {
  const result: any[] = [];
  for (let x of arr1) {
    if (!arr2.find((o) => JSON.stringify(o) === JSON.stringify(x))) {
      if (isSubQuery(x)) {
        let y = arr2.find((o2) => isSubQuery(o2) === true);
        if (y === undefined) {
          result.push({ ast: getSubAST(x) });
        } else {
          const diff = diffObjects(getSubAST(x), getSubAST(y), 'ast');
          if (Object.keys(diff).length > 0) {
            result.push({ast: diff})
          }
        }
      } else result.push(x);
    }
  }
  return result;
};

export const compareQueryASTS = (studentAST: AST, solutionAST: AST): [GeneralResponse, ASTObject, ASTObject] => {
  console.dir(solutionAST, { depth: null });
  console.dir(studentAST, { depth: null });
  try {
    let missing = diffObjects(solutionAST, studentAST, undefined);
    // console.log('missing:');
    // console.dir(missing, { depth: null });
    let extras = diffObjects(studentAST, solutionAST, undefined);
    // console.log('extras:');
    // console.dir(extras, { depth: null });
    return [{ code: 200, message: 'OK' }, missing, extras];
  } catch (error) {
    console.log(error);
    return [{ code: 500, message: 'Something went wrong while trying to compare ASTs' }, {}, {}];
  }
};