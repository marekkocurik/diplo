import { GeneralResponse } from '../../databaseControllers/databaseController';
import RecommendationsController, { RecommendationId } from '../../databaseControllers/recommendationsController';
import { ASTObject } from '../ast/lexicalAnalysis/analyzer';
import { BINARY_OPERATORS, expr, expr_list, join_op } from 'node-sql-parser/ast/postgresql';

export const recommendationsController = new RecommendationsController;

interface RecommendationWithRating {
  id: number;
  rating: number;
  recommendation: string;
}

interface Recommendation {
  query_type: string;
  statement: string;
  parent_query_type: string | undefined;
  parent_statement: string | undefined;
  recommendationsAndRatings: RecommendationWithRating[];
}

export interface RecommendationsWithDetail {
  default_detail_level: number;
  recommendations: Recommendation[];
}

interface MyAST {
  [key: string]: {
    ast: ASTObject;
  };
}

type MyColumnRef = {
  type: 'column_ref';
  table: string;
  column: string;
};

type MyExpr = {
  type: 'binary_expr';
  operator: BINARY_OPERATORS;
  left: expr | MyColumnRef;
  right: expr | MyColumnRef;
};

type MyTableBase = {
  db: string;
  table: string;
  as: string | null;
};

type MyTableJoin = MyTableBase & {
  join: join_op;
  on: MyExpr;
};

const reconstructGenericObject = (obj: ASTObject): string | undefined => {
  if ('value' in obj && obj.value !== null) return obj.value;
  else if ('table' in obj || 'column' in obj) return reconstructColumnRef(obj);
  else return undefined;
};

const reconstructColumnRef = (obj: ASTObject): string | undefined => {
  let s: string | undefined;
  if ('table' in obj && obj.table !== null) s = obj.table;
  if ('column' in obj && obj.column !== null) {
    if (s === undefined) s = obj.column;
    else s += '.' + obj.column;
  }
  if (s !== undefined && 'as' in obj && obj.as !== null) s += ' AS ' + obj.as;
  return s;
};

const reconstructWindowFunction = (obj: ASTObject): string | undefined => {
  return 'name' in obj && obj.name !== null ? obj.name + '(...)' : undefined;
  // let s: string | undefined;
  // if ('name' in obj && obj.name !== null) s = obj.name + '(...)';
  // return s;
};

const reconstructFunction = (obj: ASTObject, nesting: number): string | undefined => {
  let s: string | undefined;
  if ('name' in obj && obj.name !== null) {
    s += obj.name + '(';
    if ('args' in obj && 'value' in obj.args && Array.isArray(obj.args.value) && obj.args.value.length === 2) {
      const left = resolveType(obj.args.value[0], 0);
      const right = resolveType(obj.args.value[1], 0);
      if (left !== undefined && right !== undefined) {
        return (s += left + ', ' + right + ')');
      } else if (left !== undefined && right === undefined) {
        return (s += left + ', ...)');
      } else if (left === undefined && right !== undefined) {
        return (s += '..., ' + right + ')');
      } else return (s += '...)');
    } else return (s += '...)');
  }
  return s;
};

const resolveType = (obj: ASTObject, nesting: number): string | undefined => {
  if (nesting >= 2) return undefined;
  if ('type' in obj) {
    if (obj.type === 'column_ref') return reconstructColumnRef(obj);
    else if (obj.type === 'aggr_func') return reconstructAggregateFunction(obj, nesting + 1);
    else if (obj.type === 'case') return reconstructCase(obj, nesting + 1);
    else if (obj.type === 'window_func') return reconstructWindowFunction(obj);
    else if (obj.type === 'binary_expr') return reconstructBinaryExpr(obj, nesting + 1);
    else if (obj.type === 'function') return reconstructFunction(obj, nesting + 1);
    else if ('value' in obj && obj.value !== null) return obj.value;
  } else return reconstructGenericObject(obj);
};

const reconstructCaseBranch = (obj: ASTObject, nesting: number): string | undefined => {
  let s: string | undefined;
  if ('type' in obj) {
    if (obj.type === 'when') {
      if ('cond' in obj && !('result' in obj)) {
        const cond = resolveType(obj.cond, nesting);
        return 'WHEN' + (cond === undefined ? '..' : ' ' + cond);
      } else if (!('cond' in obj) && 'result' in obj) {
        const result = resolveType(obj.result, nesting);
        return 'WHEN.. THEN' + (result === undefined ? '..' : ' ' + result);
      } else if ('cond' in obj && 'result' in obj) {
        const cond = resolveType(obj.cond, nesting);
        const result = resolveType(obj.result, nesting);
        console.log(
          'RETURNING: ' +
            'WHEN' +
            (cond === undefined ? '..' : ' ' + cond) +
            ' THEN' +
            (result === undefined ? '..' : ' ' + result)
        );
        return (
          'WHEN' + (cond === undefined ? '..' : ' ' + cond) + ' THEN' + (result === undefined ? '..' : ' ' + result)
        );
      }
    } else {
      let ret;
      if ('result' in obj) ret = resolveType(obj.result, nesting);
      console.log('RETURNING: ' + 'ELSE' + (ret === undefined ? '..' : ' ' + ret));
      return 'ELSE' + (ret === undefined ? '..' : ' ' + ret);
    }
  }
  return s;
};

const reconstructCase = (obj: ASTObject, nesting: number): string => {
  let s: string = 'CASE';
  if ('args' in obj && Array.isArray(obj.args) && obj.args.length > 0) {
    if (obj.args.length === 1) {
      let ret = reconstructCaseBranch(obj.args[0], nesting);
      if (ret === undefined) {
        return (s += ' WHEN.. THEN.. (ELSE..)');
      } else {
        if (ret.includes('WHEN')) return (s += ' ' + ret + ' (ELSE..)');
        else return (s += ' WHEN.. THEN.. ' + ret);
      }
    } else {
      for (let [key, val] of Object.entries(obj.args)) {
        let ret = reconstructCaseBranch(val, nesting);
        s += ret === undefined ? '' : ' ' + ret;
      }
      return s;
    }
  } else return 'CASE WHEN.. THEN.. ELSE..';
};

const reconstructAggregateFunction = (obj: ASTObject, nesting: number): string | undefined => {
  let s: string | undefined;
  if ('name' in obj && obj.name !== null) {
    s = obj.name + '(';
    let ret: string | undefined;
    if ('args' in obj && 'expr' in obj.args) ret = resolveType(obj.args.expr, nesting);
    if (ret === undefined) s += '...)';
    else s += ret + ')';
    if ('as' in obj && obj.as !== null) s += ' AS ' + obj.as;
  }
  return s;
};

const reconstructBinaryExpr = (obj: ASTObject, nesting: number): string | undefined => {
  let s: string | undefined;
  if ('left' in obj && !('operator' in obj) && !('right' in obj)) {
    // iba left
    let ret = resolveType(obj.left, nesting);
    if (ret !== undefined) s = "'" + ret + "...'";
    else s = "'... <operator> ...'";
  } else if (!('left' in obj) && 'operator' in obj && !('right' in obj)) {
    // iba operator
    s = "'... " + obj.operator + " ...'";
  } else if (!('left' in obj) && !('operator' in obj) && 'right' in obj) {
    // iba right
    let ret = resolveType(obj.right, nesting);
    if (ret !== undefined) s = "'... " + ret + "'";
    else s = "'... <operator> ...'";
  } else if ('left' in obj && 'operator' in obj && !('right' in obj)) {
    // left a operator
    let ret = resolveType(obj.left, nesting);
    if (ret !== undefined) s = "'" + ret + ' ' + obj.operator + " ...'";
    else s = "'... " + obj.operator + " ...'";
  } else if (!('left' in obj) && 'operator' in obj && 'right' in obj) {
    // operator a right
    let ret = resolveType(obj.right, nesting);
    if (ret !== undefined) s = "'... " + obj.operator + ' ' + ret + "'";
    else s = "'... " + obj.operator + " ...'";
  } else if ('left' in obj && !('operator' in obj) && 'right' in obj) {
    // left a right
    let l = resolveType(obj.left, nesting);
    let r = resolveType(obj.right, nesting);
    if (l !== undefined && r === undefined) s = "'" + l + " <operator> ...'";
    else if (l === undefined && r !== undefined) s = "'... <operator> " + r + "'";
    else if (l !== undefined && r != undefined) s = "'" + l + ' <operator> ' + r + "'";
    else s = "'... operator ...'";
  } else if ('left' in obj && 'operator' in obj && 'right' in obj) {
    // vsetky
    let l = resolveType(obj.left, nesting);
    let r = resolveType(obj.right, nesting);
    if (l !== undefined && r === undefined) s = "'" + l + ' ' + obj.operator + " ...'";
    else if (l === undefined && r !== undefined) s = "'... " + obj.operator + ' ' + r + "'";
    else if (l !== undefined && r != undefined) s = "'" + l + ' ' + obj.operator + ' ' + r + "'";
    else s = "'... " + obj.operator + " ...'";
  }
  return s;
};

const aSTModified = (ast: ASTObject): boolean => {
  const keys_select = [
    'with',
    'options',
    'distinct',
    'columns',
    'into',
    'from',
    'where',
    'groupby',
    'having',
    'orderby',
    'limit',
  ];
  const keys_insert = ['table', 'columns', 'values', 'partition', 'returning'];
  const keys_update = ['table', 'set', 'where', 'returning'];
  const keys_delete = ['table', 'from', 'where'];
  const type = ast.type;
  const keys =
    type === 'select' ? keys_select : type === 'insert' ? keys_insert : type === 'update' ? keys_update : keys_delete;
  for (let k of keys) {
    if (!(k in ast)) return true;
  }
  return false;
};

const checkUnmodifiedASTs = (obj: MyAST[] | MyAST): MyAST | null => {
  if (Array.isArray(obj)) {
    for (let o of obj) {
      if (!aSTModified(o[Object.keys(o)[0]].ast)) return o;
    }
  } else if (!aSTModified(obj[Object.keys(obj)[0]].ast)) return obj;
  return null;
};

const unknownObjectMessage = (statement: string, sub_message: string): string => {
  return (
    'An unknown object has been found in the ' +
    statement +
    ' statement' +
    sub_message +
    '. Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.'
  );
};

const systemIsLimitedMessage = (message: string): string => {
  return (
    'Unfortunately, the capabilities of this recommendation system are limited. ' +
    message +
    ' Feel free to report this as bug, stating the chapter name, exercise number ' +
    'and your query. Thank you! Your help is much appreciated.'
  );
};

const generateSelectColumnsRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'SELECT',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  const sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  const diff_message = diff_type === 'missing' ? 'ALL' : 'ONLY';
  const limitedMessage = ' used in the SELECT statement' + (sub ? sub_message : '') + ' is too complex.';
  let message0, message1, message2;
  if (!('expr' in obj && 'type' in obj.expr)) {
    [message0, message1, message2] = Array(3).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
  } else {
    message0 =
      'Make sure the SELECT statement' + (sub ? sub_message : '') + ' includes ' + diff_message + ' the required';
    if (obj.expr.type === 'column_ref') {
      message0 += ' columns and required aliases.';
      const c = resolveType(obj.expr, 0);
      if (c !== undefined) {
        let col = c;
        if (col.includes('.')) col = col.split('.')[1];
        if (col.includes(' ')) col = col.split(' ')[0];
        message1 = col + ' is ' + diff_type + ' in the SELECT statement' + (sub ? sub_message : '') + '.';
        message2 = c + ' column is ' + diff_type + ' in the SELECT statement' + (sub ? sub_message : '') + '.';
      } else [message1, message2] = Array(2).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
    } else if (obj.expr.type === 'window_func') {
      message0 += ' window functions and required aliases.';
      const w = resolveType(obj.expr, 0);
      if (w !== undefined) {
        message1 =
          "Window function '" +
          w +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or contains invalid values.';
        message2 = systemIsLimitedMessage('Content of a window function' + limitedMessage);
      } else [message1, message2] = Array(2).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
    } else if (obj.expr.type === 'aggr_func') {
      message0 += ' aggregate functions and required aliases.';
      const agrf_1 = resolveType(obj.expr, 1);
      if (agrf_1 !== undefined) {
        message1 =
          "Aggregate function '" +
          agrf_1 +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or contains invalid values.';
        const agrf_2 = resolveType(obj.expr, 0);
        const alias = obj.as;
        message2 =
          "Aggregate function '" +
          agrf_2 +
          (alias !== undefined && alias !== null ? ' AS ' + alias : '') +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or contains invalid values.';
      } else [message1, message2] = Array(2).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
    } else if (obj.expr.type === 'binary_expr') {
      message0 += ' binary expressions and required aliases.';
      const b_1 = resolveType(obj.expr, 1);
      if (b_1 !== undefined) {
        message1 =
          "Binary expression '" +
          b_1 +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ', missing alias, or contains invalid values.';
        const b_2 = resolveType(obj.exp, 0);
        message2 =
          "Binary expression '" +
          b_2 +
          (obj.as !== undefined && obj.as !== null ? ' AS ' + obj.as : '') +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or contains invalid values.';
      } else [message1, message2] = Array(2).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
    } else if (obj.expr.type === 'case') {
      message0 += ' cases and required aliases.';
      const case_1 = resolveType(obj.expr, 0);
      if (case_1 !== undefined) {
        message1 =
          "Case '" +
          case_1 +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ', missing alias, or contains invalid values.';
        const case_2 = resolveType(obj.expr, -1);
        message2 =
          "Case '" +
          case_2 +
          (obj.as !== undefined && obj.as !== null ? ' AS ' + obj.as : '') +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or contains invalid values.';
      } else [message1, message2] = Array(2).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
    } else [message0, message1, message2] = Array(3).fill(unknownObjectMessage('SELECT', sub ? sub_message : ''));
  }
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectDistinctRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'DISTINCT',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let diff_message = diff_type === 'missing' ? 'removing' : 'not removing';
  let message0 = 'Try ' + diff_message + ' duplicate records in the SELECT statement' + (sub ? sub_message : '') + '.';
  let message1 = "Key word 'DISTINCT' is " + diff_type + ' in the SELECT statement' + (sub ? sub_message : '') + '.';
  let message2 =
    'Try ' +
    (diff_type === 'missing' ? 'using' : 'not using') +
    " 'SELECT DISTINCT' in the SELECT statement" +
    (sub ? sub_message : '') +
    '.';
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectFromRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'FROM',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let diff_message = diff_type === 'missing' ? 'ALL' : 'ONLY';
  let message0, message1, message2;
  message0 =
    'Make sure the FROM/JOIN statement' +
    (sub ? sub_message : '') +
    ' include ' +
    diff_message +
    ' the required tables.';
  message1 =
    'Table ' +
    ('table' in obj && obj.table !== null ? obj.table : '') +
    ' is ' +
    diff_type +
    ' in the ' +
    'FROM/JOIN statement' +
    (sub ? sub_message : '') +
    ', or you are using incorrect type of relation when joining tables. ' +
    'Try using different JOIN type, e.g. INNER JOIN, LEFT OUTER JOIN, FULL JOIN, CROSS JOIN ...';
  let t = '';
  if ('db' in obj && obj.db !== null) t += obj.db + '.';
  t += obj.table;
  message2 = t + ' is ' + diff_type + ' in the FROM/JOIN statement' + (sub ? sub_message : '');
  if (Object.keys(obj).length === 3 && 'db' in obj && 'table' in obj && 'as' in obj) {
    message2 += '.';
  } else if (
    Object.keys(obj).length > 3 &&
    'db' in obj &&
    'table' in obj &&
    'as' in obj &&
    'join' in obj &&
    'on' in obj
  ) {
    let o = obj as MyTableJoin;
    const left = resolveType(o.on.left, 0);
    const right = resolveType(o.on.right, 0);
    if (left !== undefined && right !== undefined) {
      message2 +=
        ', or the relation ' +
        left +
        ' ' +
        o.join +
        ' ' +
        right +
        ' is incorrect. Try using different type of relation, e.g. ' +
        'INNER LEFT/RIGHT JOIN, LEFT/RIGHT OUTER JOIN, FULL (OUTER) JOIN, CROSS JOIN, SELF-JOIN';
    } else if (left !== undefined && right === undefined) {
      message2 +=
        ', or the relation ' +
        left +
        ' ' +
        o.join +
        '... is incorrect. Try using different type of relation, e.g.: ' +
        'INNER LEFT/RIGHT JOIN, LEFT/RIGHT OUTER JOIN, FULL (OUTER) JOIN, CROSS JOIN, SELF-JOIN';
    } else if (left === undefined && right !== undefined) {
      message2 +=
        ', or the relation ...' +
        o.join +
        ' ' +
        right +
        ' is incorrect. Try using different type of relation, e.g.: ' +
        'INNER LEFT/RIGHT JOIN, LEFT/RIGHT OUTER JOIN, FULL (OUTER) JOIN, CROSS JOIN, SELF-JOIN';
    } else message2 = unknownObjectMessage('FROM/JOIN', sub ? sub_message : '');
  } else [message0, message1, message2] = Array(3).fill(unknownObjectMessage('FROM', sub ? sub_message : ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectWhereRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'WHERE',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let message0 = 'Make sure the condition in the WHERE statement' + (sub ? sub_message : '') + ' is correct.';
  let message1, message2;
  const cond_1 = resolveType(obj, 1);
  if (cond_1 !== undefined) {
    message1 =
      "Condition '" +
      cond_1 +
      "' in the WHERE statement" +
      (sub ? sub_message : '') +
      ' is probably ' +
      diff_type +
      ' or incorrect.';
    if ('type' in obj && obj.type === 'window_func') {
      message2 = systemIsLimitedMessage(
        'Content of a window function used in the WHERE statement' + (sub ? sub_message : '') + ' is too complex.'
      );
    } else {
      const cond_2 = resolveType(obj, 0);
      if (cond_2 !== undefined) {
        message2 =
          "Condition '" +
          cond_2 +
          "' in the WHERE statement" +
          (sub ? sub_message : '') +
          ' is probably ' +
          diff_type +
          ' or incorrect.';
      } else message2 = unknownObjectMessage('WHERE', sub ? sub_message : '');
    }
  } else [message1, message2] = Array(2).fill(unknownObjectMessage('WHERE', sub ? sub_message : ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectGroupByRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'GROUPBY',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let diff_message = diff_type === 'missing' ? 'ALL' : 'ONLY';
  let message0 =
    'Make sure the GROUP BY statement' +
    (sub ? sub_message : '') +
    ' includes ' +
    diff_message +
    ' the required columns or expressions.';
  let message1 =
    'Make sure the columns or expressions in the GROUP BY statement' +
    (sub ? sub_message : '') +
    ' are in the correct order.';
  let message2;
  const cond = resolveType(obj, 0);
  if (cond !== undefined) {
    message2 =
      "Condition '" +
      cond +
      "' in the GROUP BY statement" +
      (sub ? sub_message : '') +
      ' is ' +
      diff_type +
      ' or incorrect.';
  } else message2 = unknownObjectMessage('GROUP BY', sub ? sub_message : '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectHavingRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'HAVING',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let message0 = 'Make sure the condition in the HAVING statement' + (sub ? sub_message : '') + ' is correct.';
  let message1, message2;
  const cond_1 = resolveType(obj, 1);
  if (cond_1 !== undefined) {
    message1 =
      "Condition '" +
      cond_1 +
      "' in the HAVING statement" +
      (sub ? sub_message : '') +
      ' is probably ' +
      diff_type +
      ' or incorrect.';
    if ('type' in obj && obj.type === 'window_func') {
      message2 = systemIsLimitedMessage(
        'Content of a window function used in the HAVING statement' + (sub ? sub_message : '') + ' is too complex.'
      );
    } else {
      const cond_2 = resolveType(obj, 0);
      if (cond_2 !== undefined) {
        message2 =
          "Condition '" +
          cond_2 +
          "' in the HAVING statement" +
          (sub ? sub_message : '') +
          ' is probably ' +
          diff_type +
          ' or incorrect.';
      } else message2 = unknownObjectMessage('HAVING', sub ? sub_message : '');
    }
  } else [message1, message2] = Array(2).fill(unknownObjectMessage('HAVING', sub ? sub_message : ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectOrderByRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'ORDERBY',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let message0, message1, message2;
  message0 =
    'ORDER BY statement' +
    (sub ? sub_message : '') +
    ' is probably ' +
    diff_type +
    ', using incorrect ordering, or ' +
    'columns/expressions used in the ORDER BY statement are in the wrong order.';
  if ('type' in obj) {
    message1 =
      'ORDER BY ... ' +
      (obj.type === undefined ? 'ASC/DESC' : obj.type) +
      ' statement' +
      (sub ? sub_message : '') +
      ' is probably ' +
      diff_type +
      '. Note that there is a difference between ordering by column X, then Y, and by column Y, then X, e.g. ORDER BY x,y and ORDER BY y,x.';
    if ('expr' in obj) {
      const order = resolveType(obj.expr, 0);
      if (order !== undefined) {
        message2 =
          'ORDER BY ' +
          order +
          ' ' +
          (obj.type === undefined ? 'ASC/DESC' : obj.type) +
          ' is ' +
          diff_type +
          ', or the order of the columns/expressions in ORDER BY is incorrect.';
      } else message2 = unknownObjectMessage('ORDER BY', sub ? sub_message : '');
    } else message2 = unknownObjectMessage('ORDER BY', sub ? sub_message : '');
  } else [message1, message2] = Array(2).fill(unknownObjectMessage('ORDER BY', sub ? sub_message : ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateSelectLimitRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'SELECT',
    statement: 'LIMIT',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let sub_message = ' the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let message0 = 'Expecting more/less rows to be returned by' + (sub ? sub_message + '.' : ' a query.');
  let message1 =
    'LIMIT statement' +
    (sub ? ' of' + sub_message : '') +
    ' is ' +
    diff_type +
    ' or returning more/less rows than expected.';
  let message2;
  let limit;
  if ('value' in obj && obj.value !== null) {
    if (Array.isArray(obj.value) && obj.value.length === 1) {
      limit = resolveType(obj.value[0], 0);
      if (limit !== undefined) {
        message2 =
          'LIMIT ' +
          limit +
          ' statement' +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          (diff_type === 'missing' ? '.' : ' or returning more/less rows than expected.');
      } else message2 = unknownObjectMessage('LIMIT', sub ? sub_message : '');
    } else if (!Array.isArray(obj.value)) {
      limit = resolveType(obj.value, 0);
      if (limit !== undefined) {
        message2 =
          'LIMIT ' +
          limit +
          ' statement' +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or returning more/less rows than expected.';
      } else message2 = unknownObjectMessage('LIMIT', sub ? sub_message : '');
    } else
      message2 = systemIsLimitedMessage(
        'Content of LIMIT statement' + (sub ? ' of' + sub_message : '') + ' is too complex.'
      );
  } else message2 = unknownObjectMessage('LIMIT', sub ? sub_message : '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};

const generateInsertTableRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'INSERT',
    statement: 'TABLE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0, message1, message2;
  message0 = 'Make sure you are inserting into the correct table.';
  message1 = 'Table is ' + diff_type + ' in the INSERT INTO statement.';
  if ('table' in obj) {
    message2 = 'INSERT INTO ' + obj.table + ' is ' + (diff_type === 'missing' ? diff_type : 'incorrect') + '.';
  } else message2 = unknownObjectMessage('INSERT INTO <table>', '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateInsertColumnsRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'INSERT',
    statement: 'COLUMNS',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0, message1, message2;
  message0 =
    'Make sure the INSERT INTO statement includes ' +
    (diff_type === 'missing' ? 'ALL' : 'ONLY') +
    ' the required columns.';
  message1 =
    (diff_type === 'missing' ? 'Missing' : 'Redundant') +
    ' columns found in the INSERT INTO table(col_1, col_2, ..., col_x) statement.';
  if (Array.isArray(obj)) {
    message2 = (diff_type === 'missing' ? 'Missing' : 'Redundant') + ' column/s: ';
    for (let col of obj) message2 += col + ', ';
    message2 = message2.slice(0, -2) + ' in the INSERT INTO table(...) statement.';
    rec.recommendationsAndRatings.push(
      { id: -1, rating: -1, recommendation: message0 },
      { id: -1, rating: -1, recommendation: message1 },
      { id: -1, rating: -1, recommendation: message2 }
    );
  } else message2 = unknownObjectMessage('INSERT INTO table(column_1, column_2, ..., column_x)', '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateInsertValuesRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'INSERT',
    statement: 'VALUES',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0, message1, message2;
  let diff_message = diff_type === 'missing' ? 'ALL' : 'ONLY';
  message0 = 'Make sure you are inserting ' + diff_message + ' the required values.';
  message1 = 'VALUES statement contains incorrect values.';
  if ('value' in obj) {
    message2 = "VALUES statement is missing value '" + obj.value + "'.";
  } else message2 = unknownObjectMessage('INSERT INTO ... VALUES', '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};

const generateUpdateTableRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'UPDATE',
    statement: 'TABLE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0, message1, message2;
  message0 = 'Make sure you are updating the correct table.';
  message1 = 'Table is ' + diff_type + ' in the UPDATE statement.';
  if ('table' in obj) {
    message2 = 'UPDATE ' + obj.table + ' is ' + (diff_type === 'missing' ? diff_type : 'incorrect') + '.';
  } else message2 = unknownObjectMessage('UPDATE table', '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateUpdateSetRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'UPDATE',
    statement: 'SET',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0, message1, message2;
  message0 = 'Make sure you are setting the correct values and columns in the UPDATE statement.';
  if ('column' in obj && 'value' in obj && 'table' in obj) {
    message1 = 'SET ' + obj.column + ' is ' + diff_type + ' in the UPDATE statement.';
    let val = '...';
    if (typeof obj.value === 'object') {
      if ('value' in obj.value && (typeof obj.value.value === 'number' || typeof obj.value.value === 'string'))
        val = obj.value.value;
    }
    message2 =
      'SET ' +
      obj.column +
      ' = ' +
      val +
      ' in the UPDATE statement is ' +
      diff_type +
      ' or contains invalid values in the UPDATE statement.';
  } else [message1, message2] = Array(2).fill(unknownObjectMessage('UPDATE-SET', ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateUpdateWhereRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'UPDATE',
    statement: 'WHERE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0 = 'Make sure the condition in the UPDATE statement is correct.';
  let message1, message2;
  const cond_1 = resolveType(obj, 1);
  if (cond_1 !== undefined) {
    message1 = "Condition '" + cond_1 + "' in the UPDATE-WHERE statement is probably " + diff_type + ' or incorrect.';
    if ('type' in obj && obj.type === 'window_func') {
      message2 = systemIsLimitedMessage(
        'Content of a window function used in the UPDATE-WHERE statement is too complex.'
      );
    } else {
      const cond_2 = resolveType(obj, 0);
      if (cond_2 !== undefined) {
        message2 =
          "Condition '" + cond_2 + "' in the UPDATE-WHERE statement is probably " + diff_type + ' or incorrect.';
      } else message2 = unknownObjectMessage('UPDATE-WHERE', '');
    }
  } else [message1, message2] = Array(2).fill(unknownObjectMessage('UPDATE-WHERE', ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};

const generateDeleteFromRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'DELETE',
    statement: 'FROM',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0, message1, message2;
  message0 = 'Make sure you are deleting from the correct table.';
  message1 = 'Table is ' + diff_type + ' in the DELETE statement.';
  if ('table' in obj) {
    message2 = 'DELETE FROM ' + obj.table + ' is ' + (diff_type === 'missing' ? diff_type : 'incorrect') + '.';
  } else message2 = unknownObjectMessage('DELETE FROM', '');
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};
const generateDeleteWhereRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'DELETE',
    statement: 'WHERE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message0 = 'Make sure the condition in the DELETE statement is correct.';
  let message1, message2;
  const cond_1 = resolveType(obj, 1);
  if (cond_1 !== undefined) {
    message1 = "Condition '" + cond_1 + "' in the DELETE-WHERE statement is probably " + diff_type + ' or incorrect.';
    if ('type' in obj && obj.type === 'window_func') {
      message2 = systemIsLimitedMessage(
        'Content of a window function used in the DELETE-WHERE statement is too complex.'
      );
    } else {
      const cond_2 = resolveType(obj, 0);
      if (cond_2 !== undefined) {
        message2 =
          "Condition '" + cond_2 + "' in the DELETE-WHERE statement is probably " + diff_type + ' or incorrect.';
      } else message2 = unknownObjectMessage('DELETE-WHERE', '');
    }
  } else [message1, message2] = Array(2).fill(unknownObjectMessage('DELETE-WHERE', ''));
  rec.recommendationsAndRatings.push(
    { id: -1, rating: -1, recommendation: message0 },
    { id: -1, rating: -1, recommendation: message1 },
    { id: -1, rating: -1, recommendation: message2 }
  );
  return rec;
};

const recommender = (
  diff: ASTObject,
  diff_type: string,
  recs: Recommendation[],
  query_type: string,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
) => {
  // console.log('Checking:', diff_type, '; sub:', sub);
  for (let [key, value] of Object.entries(diff)) {
    // console.log(key, ':', value);
    if (query_type === 'select') {
      if (key === 'distinct') {
        if (typeof value === 'object' && value !== null && 'type' in value) {
          if (value.type !== null) {
            recs.push(
              generateSelectDistinctRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          }
        }
      } else if (key === 'limit') {
        if (typeof value === 'object' && value !== null) {
          if (value.value.length > 0) {
            // if (value.separator !== '' && value.value.length > 0) {
            recs.push(
              generateSelectLimitRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          }
        }
      } else if (
        key === 'columns' ||
        key === 'from' ||
        key === 'where' ||
        key === 'groupby' ||
        key === 'having' ||
        key === 'orderby'
      ) {
        if (Array.isArray(value) && value.length > 0) {
          for (let [v_key, v_val] of Object.entries(value)) {
            if (typeof v_val === 'object' && v_val !== null && 'ast' in v_val) {
              const subAST = v_val['ast'] as ASTObject;
              let newBranch = key === 'columns' ? 'select' : key;
              recommender(subAST, diff_type, recs, 'select', 'select', newBranch);
            } else if (key === 'columns') {
              recs.push(
                generateSelectColumnsRecommendations(
                  v_val,
                  diff_type,
                  parent_query_type !== undefined,
                  parent_query_type,
                  parent_query_statement
                )
              );
            } else if (key === 'from') {
              recs.push(
                generateSelectFromRecommendations(
                  v_val,
                  diff_type,
                  parent_query_type !== undefined,
                  parent_query_type,
                  parent_query_statement
                )
              );
            } else if (key === 'where') {
              recs.push(
                generateSelectWhereRecommendations(
                  v_val,
                  diff_type,
                  parent_query_type !== undefined,
                  parent_query_type,
                  parent_query_statement
                )
              );
            } else if (key === 'groupby') {
              recs.push(
                generateSelectGroupByRecommendations(
                  v_val,
                  diff_type,
                  parent_query_type !== undefined,
                  parent_query_type,
                  parent_query_statement
                )
              );
            } else if (key === 'having') {
              recs.push(
                generateSelectHavingRecommendations(
                  v_val,
                  diff_type,
                  parent_query_type !== undefined,
                  parent_query_type,
                  parent_query_statement
                )
              );
            } else if (key === 'orderby') {
              recs.push(
                generateSelectOrderByRecommendations(
                  v_val,
                  diff_type,
                  parent_query_type !== undefined,
                  parent_query_type,
                  parent_query_statement
                )
              );
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          if ('ast' in value) {
            const subAST = value['ast'] as ASTObject;
            let newBranch = key === 'columns' ? 'select' : key;
            recommender(subAST, diff_type, recs, 'select', 'select', newBranch);
          } else if (key === 'columns') {
            recs.push(
              generateSelectColumnsRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          } else if (key === 'from') {
            recs.push(
              generateSelectFromRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          } else if (key === 'where') {
            recs.push(
              generateSelectWhereRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          } else if (key === 'groupby') {
            recs.push(
              generateSelectGroupByRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          } else if (key === 'having') {
            recs.push(
              generateSelectHavingRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          } else if (key === 'orderby') {
            recs.push(
              generateSelectOrderByRecommendations(
                value,
                diff_type,
                parent_query_type !== undefined,
                parent_query_type,
                parent_query_statement
              )
            );
          }
        }
      }
    } else if (query_type === 'insert') {
      if (key === 'table') {
        if (Array.isArray(value) && value.length > 0) {
          for (let [v_key, v_val] of Object.entries(value)) {
            recs.push(generateInsertTableRecommendations(v_val, diff_type));
          }
        } else recs.push(generateInsertTableRecommendations(value, diff_type));
      } else if (key === 'columns') {
        recs.push(generateInsertColumnsRecommendations(value, diff_type));
      } else if (key === 'values') {
        if (Array.isArray(value) && value.length > 0) {
          for (let [v_key, v_val] of Object.entries(value)) {
            if (typeof v_val === 'object' && v_val !== null && 'type' in v_val && v_val.type === 'expr_list') {
              const o = v_val as expr_list;
              for (let [o_key, o_val] of Object.entries(o.value)) {
                if (typeof o_val === 'object' && o_val !== null && 'ast' in o_val) {
                  const subAST = o_val['ast'] as ASTObject;
                  recommender(subAST, diff_type, recs, 'select', 'insert', 'values');
                } else recs.push(generateInsertValuesRecommendations(o_val, diff_type));
              }
            }
          }
        } else {
          if (typeof value === 'object' && value !== null && 'ast' in value) {
            const subAST = value['ast'] as ASTObject;
            recommender(subAST, diff_type, recs, 'select', 'insert', 'values');
          }
        }
      }
    } else if (query_type === 'update') {
      if (Array.isArray(value) && value.length > 0) {
        for (let [v_key, v_val] of Object.entries(value)) {
          if (key === 'table') {
            recs.push(generateUpdateTableRecommendations(v_val, diff_type));
          } else if (key === 'set' || key === 'where') {
            if (typeof v_val === 'object' && v_val !== null) {
              if ('ast' in v_val) {
                const subAST = v_val['ast'] as ASTObject;
                recommender(subAST, diff_type, recs, 'select', 'update', key);
              } else {
                if (key === 'set') {
                  recs.push(generateUpdateSetRecommendations(v_val, diff_type));
                } else if (key === 'where') {
                  recs.push(generateUpdateWhereRecommendations(v_val, diff_type));
                }
              }
            }
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if ('ast' in value) {
          const subAST = value['ast'] as ASTObject;
          recommender(subAST, diff_type, recs, 'select', 'delete', 'where');
        } else if (key === 'table') {
          recs.push(generateUpdateTableRecommendations(value, diff_type));
        } else if (key === 'set') {
          recs.push(generateUpdateSetRecommendations(value, diff_type));
        } else if (key === 'where') {
          recs.push(generateUpdateWhereRecommendations(value, diff_type));
        }
      }
    } else if (query_type === 'delete') {
      if (Array.isArray(value) && value.length > 0) {
        for (let [v_key, v_val] of Object.entries(value)) {
          if (key === 'table') {
            recs.push(generateDeleteFromRecommendations(v_val, diff_type));
          } else if (key === 'where') {
            if (typeof v_val === 'object' && v_val !== null) {
              if ('ast' in v_val) {
                const subAST = v_val['ast'] as ASTObject;
                recommender(subAST, diff_type, recs, 'select', 'delete', 'where');
              } else recs.push(generateDeleteWhereRecommendations(v_val, diff_type));
            }
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if (key === 'table') {
          recs.push(generateDeleteFromRecommendations(value, diff_type));
        } else if (key === 'where') {
          if ('ast' in value) {
            const subAST = value['ast'] as ASTObject;
            recommender(subAST, diff_type, recs, 'select', 'delete', 'where');
          } else recs.push(generateDeleteWhereRecommendations(value, diff_type));
        }
      }
    }
  }
};

const checkIfContainsSubAST = (obj: ASTObject, parent: string | undefined): MyAST[] | MyAST | null => {
  let asts: ASTObject[] = [];
  for (let [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      if ('ast' in value) {
        let newObj: { [key: string]: any } = {};
        if (parent === undefined) {
          newObj[key] = value;
          asts.push({ ...newObj });
        } else {
          newObj[parent] = value;
          asts.push({ ...newObj });
        }
      } else if (Array.isArray(value)) {
        for (let [k, v] of Object.entries(value)) {
          if (typeof v === 'object' && v !== null) {
            if ('ast' in v) {
              let newObj: { [key: string]: any } = {};
              if (parent === undefined) {
                newObj[key] = v;
                asts.push({ ...newObj });
              } else {
                newObj[parent] = v;
                asts.push({ ...newObj });
              }
            } else {
              let ret = checkIfContainsSubAST(v as ASTObject, parent === undefined ? key : parent);
              if (ret !== null) {
                if (Array.isArray(ret)) asts.push(...ret);
                else asts.push(ret);
              }
            }
          }
        }
      } else {
        let ret = checkIfContainsSubAST(value as ASTObject, parent === undefined ? key : parent);
        if (ret !== null) {
          if (Array.isArray(ret)) asts.push(...ret);
          else asts.push(ret);
        }
      }
    }
  }
  if (asts.length === 1) return asts[0];
  else if (asts.length > 1) return asts;
  else return null;
};

const generateGeneralRecommendation = (queryType: string, branch: string, diff_type: string): Recommendation | null => {
  let rec = {
    query_type: 'GENERAL',
    statement: 'GENERAL',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendationsAndRatings: [] as RecommendationWithRating[],
  };
  let message;
  if (queryType === 'select') {
    if (diff_type === 'missing') {
      let s =
        branch === 'columns'
          ? 'SELECT (SELECT ... nested query) <AS alias>, <values> FROM ...;\n' +
            'SELECT <values>, (SELECT ... nested query), <values> FROM ...;\n'
          : branch === 'from'
          ? 'SELECT ... FROM (SELECT ... nested query) <AS alias>;\n' +
            'SELECT ... FROM (SELECT ... nested query) <AS alias> WHERE ...;'
          : branch === 'where'
          ? 'SELECT ... FROM ... WHERE <operand> <operator> (SELECT ... nested query);\n' +
            'SELECT ... FROM ... WHERE (SELECT ... nested query) <operator> <operand>;'
          : 'SELECT ... FROM ... GROUP BY ... HAVING <operand> <operator> (SELECT ... nested query);\n' +
            'SELECT ... FROM ... GROUP BY ... HAVING (SELECT ... nested query) <operator> <operand>;';
      message =
        'Apparently, it is needed to use nested query in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase()) +
        ' statement. Here are some examples:\n\n' +
        s;
    } else if (diff_type === 'redundant') {
      message =
        'Unfortunately, there is no known solution that uses nested query in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase()) +
        ' statement. Apparently, this exercise can be solved without using nested query.';
    } else {
      let s: string =
        branch === 'columns'
          ? 'SELECT (SELECT ... nested query) <AS alias>, <values> FROM ...;\n' +
            'SELECT <values>, (SELECT ... nested query), <values> FROM ...;\n'
          : branch === 'from'
          ? 'SELECT ... FROM (SELECT ... nested query) <AS alias>;\n' +
            'SELECT ... FROM (SELECT ... nested query) <AS alias> WHERE ...;'
          : branch === 'where'
          ? 'SELECT ... FROM ... WHERE <operand> <operator> (SELECT ... nested query);\n' +
            'SELECT ... FROM ... WHERE (SELECT ... nested query) <operator> <operand>;'
          : 'SELECT ... FROM ... GROUP BY ... HAVING <operand> <operator> (SELECT ... nested query);\n' +
            'SELECT ... FROM ... GROUP BY ... HAVING (SELECT ... nested query) <operator> <operand>;';
      message =
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase()) +
        ' statement. Here are some examples:\n\n' +
        s;
    }
  } else if (queryType === 'insert') {
    if (diff_type === 'missing') {
      message =
        'Apparently, it is needed to use nested query in the VALUES / SELECT statement. Here are some examples:\n\n' +
        'INSERT INTO ... VALUES (<values>, (SELECT ... nested query), <values>);\n' +
        'INSERT INTO ... SELECT <values>, (SELECT ... nested query), <values>;';
    } else if (diff_type === 'redundant') {
      message =
        'Unfortunately, there is no known solution that uses nested query in the VALUES / SELECT statement. Apparently, ' +
        'this exercise can be solved without using nested query.';
    } else {
      message =
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in different statement. Here are some examples:\n\n' +
        'INSERT INTO ... VALUES (<values>, (SELECT ... nested query), <values>);\n' +
        'INSERT INTO ... SELECT <values>, (SELECT ... nested query), <values>;';
    }
  } else if (queryType === 'update') {
    if (diff_type === 'missing') {
      message =
        'Apparently, it is needed to use nested query in the ' +
        branch.toUpperCase() +
        ' statement. Here are some examples:\n\n' +
        (branch === 'set'
          ? 'UPDATE ... SET <column_name> = (SELECT ... nested query)\n' +
            'UPDATE ... SET <column_name> = (SELECT ... nested query) WHERE ...'
          : 'UPDATE ... SET ... WHERE (SELECT ... nested query) <operator> <operand>\n' +
            'UPDATE ... SET ... WHERE <operand> <operator> (SELECT ... nested query)');
    } else if (diff_type === 'redundant') {
      message =
        'Unfortunately, there is no known solution that uses nested query in the ' +
        branch +
        ' statement. Apparently, this exercise can be solved without using nested query.';
    } else {
      message =
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in ' +
        branch.toUpperCase() +
        ' statement. Here are some examples:\n\n' +
        (branch === 'set'
          ? 'UPDATE ... SET <column_name> = (SELECT ... nested query)\n' +
            'UPDATE ... SET <column_name> = (SELECT ... nested query) WHERE ...'
          : 'UPDATE ... SET ... WHERE (SELECT ... nested query) <operator> <operand>\n' +
            'UPDATE ... SET ... WHERE <operand> <operator> (SELECT ... nested query)');
    }
  } else if (queryType === 'delete') {
    if (diff_type === 'missing') {
      message =
        'Apparently, it is needed to use nested query in the WHERE statement. Here are some examples:\n\n' +
        'DELETE FROM ... WHERE <operand> <operator> (SELECT ... nested query);\n' +
        'DELETE FROM ... WHERE (SELECT ... nested query) <operator> <operand>;';
    } else if (diff_type === 'redundant') {
      message =
        'Unfortunately, there is no known solution that uses nested query in the WHERE statement. Apparently, ' +
        'this exercise can be solved without using nested query.';
    } else {
      message =
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in different statement. Here are some examples:\n\n' +
        'DELETE FROM ... WHERE <operand> <operator> (SELECT ... nested query);\n' +
        'DELETE FROM ... WHERE (SELECT ... nested query) <operator> <operand>;';
    }
  }
  if (message === undefined) return null;
  else {
    rec.recommendationsAndRatings.push(
      { id: -1, rating: -1, recommendation: message },
      { id: -1, rating: -1, recommendation: message },
      { id: -1, rating: -1, recommendation: message }
    );
    return rec;
  }
};

const removeDuplicateRecommendations = (recs: Recommendation[]): Recommendation[] => {
  let newRecs: Recommendation[] = [];
  for (let r of recs) {
    if (!newRecs.find((x) => JSON.stringify(x) === JSON.stringify(r))) newRecs.push(r);
    else console.log('Removing: ', r);
  }
  return newRecs;
};

export const createRecommendations = (
  queryType: string,
  missing: ASTObject,
  extras: ASTObject,
  cluster: number
): RecommendationsWithDetail => {
  let recs: Recommendation[] = [];
  let generalRecommendation: Recommendation | null;

  let missing_asts; //= checkIfContainsSubAST(missing);
  let extras_asts; //= checkIfContainsSubAST(extras);

  console.log('missing:');
  console.dir(missing, { depth: null });
  console.log('extras:');
  console.dir(extras, { depth: null });

  if (Object.keys(missing).length > 0 && Object.keys(extras).length === 0) {
    console.log('First case');
    missing_asts = checkIfContainsSubAST(missing, undefined);
    // console.log('miss_asts:');
    // console.dir(missing_asts, { depth: null });

    if (missing_asts !== null) {
      const unmodifiedAST = checkUnmodifiedASTs(missing_asts);
      if (unmodifiedAST !== null) {
        const key = Object.keys(unmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; missing ast value:', unmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'missing');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
      }
    }
    recommender(missing, 'missing', recs, queryType, undefined, undefined);
    /**
     * ak je to null, potom: ---> DONE!
     *      a. stud: normal, sol: normal                                -> vytvorim odporucania
     *      b. stud: subQuery, sol: subQuery, ale subquery sa zhoduju   -> vytvorim odporucania
     * ak to nie je null, potom:
     *      a. ast je full -->      stud: normal, sol: subQuery         -> otestujem ako vyzera ked chyba cele AST
     *                                                                  -> vytvorim odporucanie, ktore povie:
     *                                                                      "Skus pouzit subQuery vo vetve X.."
     *                                                                  -> nasledne vytvorim odporucania
     *      b. ast nie je full -->  stud: subQuery, sol: subQuery, rovnake vetvy, ale studentovi v subQuery nieco chyba
     *                                                                  -> vytvorim odporucania
     */
  } else if (Object.keys(missing).length === 0 && Object.keys(extras).length > 0) {
    console.log('Second case');
    extras_asts = checkIfContainsSubAST(extras, undefined);
    // console.log('extras_asts:');
    // console.dir(extras_asts, { depth: null });

    if (extras_asts !== null) {
      const unmodifiedAST = checkUnmodifiedASTs(extras_asts);
      if (unmodifiedAST !== null) {
        const key = Object.keys(unmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; extras ast value:', unmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'redundant');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
      }
    }
    recommender(extras, 'redundant', recs, queryType, undefined, undefined);
    /**
     * ak to je null, potom:
     *      a. stud: normal, sol: normal                                -> vytvorim odporucania
     *      b. stud: subQuery, sol: subQuery, ale subquery sa zhoduju   -> vytvorim odporucania
     * ak to nie je null, potom:
     *      a. ast je full -->      stud: subQuery, sol: normal         -> vytvorim odporucanie, ktore povie:
     *                                                                      "Ulohu je mozne vyriesit bez pouzitia subQuery" alebo
     *                                                                      ak student ma 2 subquery a sol ma iba jedno
     *                                                                      "Ulohu je mozne vyriesit bez subquery vo vetve X
     *                                                                       Bohuzial nepozname riesenie ...."
     *                                                                  -> TOTO JE NAJHORSI MOZNY PRIPAD, pretoze budem studenta
     *                                                                     navadzat aby komplet prepisal svoje riesenie
     *      b. ast nie je full -->  stud: subQuery, sol: subQuery, rovnake vetvy, ale student ma v subQuery nieco navyse
     *                                                                  -> vytvorim odporucania
     */
  } else if (Object.keys(missing).length > 0 && Object.keys(extras).length > 0) {
    console.log('Third case');
    missing_asts = checkIfContainsSubAST(missing, undefined);
    extras_asts = checkIfContainsSubAST(extras, undefined);
    // console.log('miss_asts:');
    // console.dir(missing_asts, { depth: null });
    // console.log('extras_asts:');
    // console.dir(extras_asts, { depth: null });

    if (missing_asts !== null && extras_asts === null) {
      const missingUnmodifiedAST = checkUnmodifiedASTs(missing_asts);
      if (missingUnmodifiedAST !== null) {
        const key = Object.keys(missingUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; missing ast value:', missingUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'missing');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
        // console.log('MISSING GENERAL RECOMMENDATION:', generalRecommendation);
      }
    } else if (missing_asts === null && extras_asts !== null) {
      const extrasUnmodifiedAST = checkUnmodifiedASTs(extras_asts);
      if (extrasUnmodifiedAST !== null) {
        const key = Object.keys(extrasUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; extras ast value:', extrasUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'redundant');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
        // console.log('EXTRAS GENERAL RECOMMENDATION:', generalRecommendation);
      }
    } else if (missing_asts !== null && extras_asts !== null) {
      const missingUnmodifiedAST = checkUnmodifiedASTs(missing_asts);
      const extrasUnmodifiedAST = checkUnmodifiedASTs(extras_asts);
      if (missingUnmodifiedAST !== null && extrasUnmodifiedAST === null) {
        const key = Object.keys(missingUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; missing ast value:', missingUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'missing');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
        // console.log('MISSING GENERAL RECOMMENDATION:', generalRecommendation);
      } else if (missingUnmodifiedAST === null && extrasUnmodifiedAST !== null) {
        const key = Object.keys(extrasUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; extras ast value:', extrasUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'redundant');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
        // console.log('EXTRAS GENERAL RECOMMENDATION:', generalRecommendation);
      } else if (missingUnmodifiedAST !== null && extrasUnmodifiedAST !== null) {
        const key = Object.keys(missingUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; missing ast value:', missingUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'both');
        if (generalRecommendation !== null) recs.push(generalRecommendation);
        // console.log('MISSING GENERAL RECOMMENDATION:', generalRecommendation);
      }
    }
    recommender(missing, 'missing', recs, queryType, undefined, undefined);
    recommender(extras, 'redundant', recs, queryType, undefined, undefined);
    /**
     * ak su oboje null:
     *      a. nieco mu chyba, nieco ma navyse, NIE SU TAM AST (alebo su spravne)   -> vytvorim odporucania
     * ak iba missing nie je null:
     *      a. aspon jedno AST je full                  -> chyba mu cele subquery vo vetve X, cize
     *                                                     "Skus pouzit subquery vo vetve x" + vytvorim odporucania
     *      b. ziadne nie je full                       -> nieco mu chyba v subqueries, takze vytvorim odporucania
     * ak iba extras nie je null:
     *      a. aspon jedno AST je full                  -> OPAT NAJHORSI PRIPAD, pretoze ma navyse cele query, takze sa asi snazi
     *                                                     vyriesit ulohu novym sposobom, cize
     *                                                     "Ulohu je mozne vyriesit bez pouzitia subquery vo vetve X
     *                                                      Bohuzial nepozname riesenie ...." + odporucania
     *      b. ziadne nie je full                       -> v subqueries ma nieco navyse, takze vytvorim odporucania
     * ani jedno nie je null:
     *      a. obe maju aspon jedno full                -> VELMI ZLY PRIPAD, pretoze ma subquery v nespravnej vetve, respektive
     *                                                     nepoznam riesenie so subquery v rovnakej vetve, takze budem studenta zavadzat
     *                                                      "Pre tuto ulohu je potrebne subquery, no nepozname riesenie so subquery
     *                                                      v rovnakej vetve ako napisal student, takze mozeme zavzadzat ...."
     *      b. iba missing ma aspon jedno full          -> chyba mu cele subquery vo vetve X, cize
     *                                                     "Skus pouzit subquery vo vetve x" + vytvorim odporucania
     *      c. iba extras ma aspon jedno full           -> DALSI NAJHORSI PRIPAD
     *                                                     "Ulohu je mozne vyriesit bez pouzitia subquery vo vetve X" + odporucania
     *      d. ziadne nema aspon jedno full             -> nieco mu chyba, nieco ma navyse... cize vytvorim odporucania
     */
  }

  /* if (missing_asts === null && extras_asts === null) {}
   *
   * oboje su null ->           stud: normal, sol: normal
   * missing nie je null ->     stud: normal, sol: subQuery
   * extras nie je null ->      stud: subQuery, sol: normal
   * oboje nie su null ->       stud: subQuery, sol: subQuery (tu je este rozdiel ci su to rovnake alebo rozdielne vetvy)
   *
   *   if (Object.keys(missing).length > 0) {
   *     console.log('Creating recommendations for missing objects');
   *     recommender(queryType, missing, 'missing', recs, false, undefined);
   *   }
   *   if (Object.keys(extras).length > 0) {
   *     console.log('Creating recommendations for extras objects');
   *     recommender(queryType, extras, 'extra', recs, false, undefined);
   *   }
   */

  recs = removeDuplicateRecommendations(recs);
  // console.log('recs:');
  // console.dir(recs, { depth: null });
  let result: RecommendationsWithDetail = {
    default_detail_level: cluster,
    recommendations: recs,
  };
  return result;
};

export const insertRecommendations = async (recs: RecommendationsWithDetail, ute: number): Promise<GeneralResponse> => {
  try {
    let insert =
      'INSERT INTO users.recommendations(users_to_exercises_id, query_type, statement, ' +
      'parent_query_type, parent_statement, recommendation, visited, detail_level, creation_date, last_update) VALUES \n';
    let i = 0;
    if (recs.recommendations[0].query_type === 'GENERAL') {
      i = 1;
      let r = recs.recommendations[0];
      insert += '(' + ute + ",'" + r.query_type + "','" + r.statement + "',";
      if (r.parent_query_type === undefined) insert += 'null,';
      else insert += "'" + r.parent_query_type + "',";
      if (r.parent_statement === undefined) insert += 'null,';
      else insert += "'" + r.parent_statement + "',";
      insert +=
        "'" +
        r.recommendationsAndRatings[0].recommendation.replace(/'/g,"''") +
        "', true, 'low', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), \n";
    }
    let ddl;
    for (; i < recs.recommendations.length; i++) {
      let r = recs.recommendations[i];
      for (let j = 0; j < 3; j++) {
        ddl = j === 0 ? 'low' : j === 1 ? 'medium' : 'high';
        insert += '(' + ute + ",'" + r.query_type + "','" + r.statement + "',";
        if (r.parent_query_type === undefined) insert += 'null,';
        else insert += "'" + r.parent_query_type + "',";
        if (r.parent_statement === undefined) insert += 'null,';
        else insert += "'" + r.parent_statement + "',";
        insert +=
          "'" +
          r.recommendationsAndRatings[j].recommendation.replace(/'/g,"''") +
          "'," +
          (i === 0 && j === 0) +
          ",'" +
          ddl +
          "', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), \n";
      }
    }
    insert = insert.slice(0, -3) + '\nRETURNING id;';
    // console.log('inserting recommendations: ', insert);
    let resp = await recommendationsController.insertManyReturningIds(insert);
    const ids = resp[1] as RecommendationId[];
    // console.log('before:');
    // console.dir(recs, { depth: null });
    i = 0;
    let genSet = false;
    if (recs.recommendations[0].query_type === 'GENERAL') {
      i = 1;
      genSet = true;
      recs.recommendations[0].recommendationsAndRatings[0].id = ids[0].id;
      recs.recommendations[0].recommendationsAndRatings[1].id = ids[0].id;
      recs.recommendations[0].recommendationsAndRatings[2].id = ids[0].id;
    }
    for (; i < recs.recommendations.length; i++) {
      let r = recs.recommendations[i];
      for (let j = 0; j < 3; j++) {
        r.recommendationsAndRatings[j].id = ids[genSet ? (i - 1) * 3 + j + 1 : i * 3 + j].id;
      }
    }
    // console.log('after:');
    // console.dir(recs, { depth: null });
    return { code: 200, message: 'OK' };
  } catch (error) {
    return { code: 500, message: 'Something went wrong while trying to insert new recommendations' };
  }
};

export const getRecommendationId = async (
  users_to_exercises_id: number,
  recommendation: string
): Promise<[GeneralResponse, number]> => {
  try {
    let response = await recommendationsController.getIdByUsersToExercisesIdAndRecommendation(
      users_to_exercises_id,
      recommendation
    );
    return response;
  } catch (error) {
    return [{ code: 500, message: 'Something went wrong while trying to get Recommendation ID' }, -1];
  }
};

export const updateRecommendationVisitedById = async (id: number): Promise<GeneralResponse> => {
  try {
    let response = await recommendationsController.updateVisited(id);
    return response;
  } catch (error) {
    return { code: 500, message: 'Something went wrong while trying to update Recommendation to visited' };
  }
};

export const updateRecommendationRatingById = async (id: number, rating: number): Promise<GeneralResponse> => {
  try {
    let response = await recommendationsController.updateRating(id, rating);
    return response;
  } catch (error) {
    return { code: 500, message: 'Something went wrong while trying to update Recommendation to visited' };
  }
};
