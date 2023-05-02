import { AST } from 'node-sql-parser/build/postgresql';
import { ASTObject } from './analyzer';

function diffObjects(obj1: ASTObject, obj2: ASTObject): ASTObject {
  let result: ASTObject = {};
  for (let [key, value1] of Object.entries(obj1)) {
    const value2 = obj2[key];
    if (value1 !== null) {
      //console.log('checking:', key, ':', value1);
      if (value2 === undefined || value2 === null) {
        result[key] = value1;
      } else if (typeof value1 !== typeof value2) {
        result[key] = value1;
      } else if (typeof value1 !== 'object') {
        if (value1 !== value2) {
          result[key] = value1;
        }
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
        // console.log('here');
        const diff = diffObjects(value1, value2);
        if (Object.keys(diff).length > 0) {
          result[key] = diff;
        }
      }
    } //else console.log('skipping:', key, ':', value1);
  }
  return result;
}

const isSubQuery = (value: any): value is AST => {
  if (typeof value === 'object' && 'expr' in value && 'ast' in value['expr']) return true;
  else return false;
};

const getSubAST = (ast: ASTObject): ASTObject => {
  if (typeof ast === 'object' && 'expr' in ast && 'ast' in ast['expr'])
    return ast['expr']['ast'];
  return {};
}

function diffArrays(arr1: ASTObject[], arr2: ASTObject[]): ASTObject {
  const result: any[] = [];
  for (let x of arr1) {
    if (!arr2.find((o) => JSON.stringify(o) === JSON.stringify(x))) {
      if (isSubQuery(x)) {
        let y = arr2.find((o2) => isSubQuery(o2) === true);
        if (y === undefined) {
          const newAST = getSubAST(x);
          result.push({ast: newAST});
        } else {
          result.push({ast: diffObjects(getSubAST(x), getSubAST(y))});
        }
      } else result.push(x);
    }
  }
  // for (let i = 0; i < arr1.length; i++) {
  //   const diff = diffObjects(arr1[i], arr2[i]);
  //   if (Object.keys(diff).length > 0) {
  //     result[i] = diff;
  //   }
  // }
  return result;
}

export const compareQueryASTS = (studentAST: AST, solutionAST: AST) => {
  console.dir(solutionAST, { depth: null });
  console.dir(studentAST, { depth: null });
  try {
    let missing = diffObjects(solutionAST, studentAST);
    console.log('missing:');
    console.dir(missing, { depth: null });
    let extras = diffObjects(studentAST, solutionAST);
    console.log('extras:');
    console.dir(extras, { depth: null });
  } catch (error) {
    console.log(error);
  }

  /**
   * 1. ked ukladam co je missing / extras, musim si zapamatat ci je nejaka vetva nadtym, resp ci som v subquery a podobne..
   */
};
