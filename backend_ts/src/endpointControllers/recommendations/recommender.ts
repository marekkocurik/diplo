import { ASTObject } from '../ast/lexicalAnalysis/analyzer';
import {
  BINARY_OPERATORS,
  additive_expr,
  aggr_filter,
  aggr_func,
  binary_expr,
  case_expr,
  count_arg,
  distinct_args,
  expr,
  expr_item,
  expr_list,
  join_op,
  over_partition,
  window_func,
} from 'node-sql-parser/ast/postgresql';

interface Recommendation {
  query_type: string;
  statement: string;
  parent_query_type: string | undefined;
  parent_statement: string | undefined;
  recommendation: string[];
}

export interface Recommendations {
  default_detail_level: number;
  generalRecommendation: string;
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

type MyColumnRefWithNullTable = {
  type: 'column_ref';
  table: string | null;
  column: string;
};

interface MySelectColumn {
  type: string;
  expr: MyColumnRef | aggr_func | binary_expr | window_func;
  as: string | undefined;
}

type MyAggrFunc = {
  type: 'aggr_func';
  name: string;
  args: { expr: additive_expr | MyColumnRef | case_expr } | count_arg;
  over: over_partition;
  filter?: aggr_filter;
};

type MyExpr = {
  type: 'binary_expr';
  operator: BINARY_OPERATORS;
  left: expr | MyColumnRef;
  right: expr | MyColumnRef;
};

type MyExprHaving = {
  type: 'binary_expr';
  operator: BINARY_OPERATORS;
  left: expr | MyColumnRefWithNullTable | MyAggrFunc;
  right: expr | MyColumnRefWithNullTable | MyAggrFunc;
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

type MyExprList = {
  type: 'expr_list';
  value: expr_item[] | MyColumnRefWithNullTable[];
};

type MyGroupBy = {
  type: string;
  name: string;
  args: MyExprList;
};

type MyOrderByElement = {
  expr: MyExpr | MyAggrFunc | MyColumnRefWithNullTable;
  type: 'ASC' | 'DESC';
  nulls: 'NULLS FIRST' | 'NULLS LAST' | undefined;
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
        return (
          'WHEN' + (cond === undefined ? '..' : ' ' + cond) + ' THEN' + (result === undefined ? '..' : ' ' + result)
        );
      }
    } else {
      let ret = resolveType(obj, nesting);
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
    if ('args' in obj && 'expr' in obj.args) {
      const expr = obj.args.expr;
      const ret = resolveType(expr, nesting);
      s += ret === undefined ? '...)' : ret + ')';
      if ('as' in expr && expr.as !== null) s += ' AS ' + expr.as;
    } else {
      s += '...)';
      if ('as' in obj && obj.as !== null) s += ' AS ' + obj.as;
    }
  }
  return s;
};

const reconstructBinaryExpr = (obj: ASTObject, nesting: number): string | undefined => {
  let s: string | undefined;
  if ('left' in obj && !('operator' in obj) && !('right' in obj)) {
    // iba left
    let ret = resolveType(obj.left, nesting);
    if (ret !== undefined) s = "'" + ret + "...'";
  } else if (!('left' in obj) && 'operator' in obj && !('right' in obj)) {
    // iba operator
    s = "'... " + obj.operator + " ...'";
  } else if (!('left' in obj) && !('operator' in obj) && 'right' in obj) {
    // iba right
    let ret = resolveType(obj.right, nesting);
    if (ret !== undefined) s = "'..." + ret + "'";
  } else if ('left' in obj && 'operator' in obj && !('right' in obj)) {
    // left a operator
    let ret = resolveType(obj.left, nesting);
    if (ret !== undefined) s = "'" + ret + ' ' + obj.operator + "...'";
  } else if (!('left' in obj) && 'operator' in obj && 'right' in obj) {
    // operator a right
    let ret = resolveType(obj.right, nesting);
    if (ret !== undefined) s = "'..." + obj.operator + ' ' + ret + "'";
  } else if ('left' in obj && !('operator' in obj) && 'right' in obj) {
    // left a right
    let l = resolveType(obj.left, nesting);
    let r = resolveType(obj.right, nesting);
    if (l !== undefined && r === undefined) s = "'" + l + "...'";
    else if (l === undefined && r !== undefined) s = "'..." + r + "'";
    else if (l !== undefined && r != undefined) s = "'" + l + '...' + r + "'";
  } else if ('left' in obj && 'operator' in obj && 'right' in obj) {
    // vsetky
    let l = resolveType(obj.left, nesting);
    let r = resolveType(obj.right, nesting);
    if (l !== undefined && r === undefined) s = "'" + l + ' ' + obj.operator + "...'";
    else if (l === undefined && r !== undefined) s = "'..." + obj.operator + ' ' + r + "'";
    else if (l !== undefined && r != undefined) s = "'" + l + ' ' + obj.operator + ' ' + r + "'";
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
    recommendation: [] as string[],
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
          "(...)' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ' or contains invalid values.';
        const agrf_2 = resolveType(obj.expr, 0);
        message2 =
          "Aggregate function '" +
          agrf_2 +
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
      const case_1 = resolveType(obj.expr, 1);
      if (case_1 !== undefined) {
        message1 =
          "Case '" +
          case_1 +
          "' in the SELECT statement" +
          (sub ? sub_message : '') +
          ' is ' +
          diff_type +
          ', missing alias, or contains invalid values.';
        const case_2 = resolveType(obj.expr, 0);
        message2 =
          "Binary expression '" +
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
  rec.recommendation.push(message0, message1, message2);
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
    recommendation: [] as string[],
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
  rec.recommendation.push(message0, message1, message2);
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
    recommendation: [] as string[],
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
  rec.recommendation.push(message0, message1, message2);
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
    recommendation: [] as string[],
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
  rec.recommendation.push(message0, message1, message2);
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
    recommendation: [] as string[],
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
  rec.recommendation.push(message0, message1, message2);
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
    recommendation: [] as string[],
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
  rec.recommendation.push(message0, message1, message2);
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
    recommendation: [] as string[],
  };
  let sub_message = ' of the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  if ('expr' in obj && 'type' in obj) {
    let o = obj as MyOrderByElement;
    let message0 =
      'ORDER BY statement' +
      (sub ? sub_message : '') +
      ' is probably ' +
      diff_type +
      ', using incorrect ordering, or ' +
      'columns/expressions used in the ORDER BY statement are in the wrong order.';
    let message1 =
      'ORDER BY ... ' +
      o.type +
      ' statement' +
      (sub ? sub_message : '') +
      ' is probably ' +
      diff_type +
      '. Note that there is a difference between ORDER BY x,y and ORDER BY y,x.';
    let message2 = '';
    if (o.expr.type === 'column_ref') {
      let col = o.expr.table === null ? o.expr.column : o.expr.table + '.' + o.expr.column;
      message2 += 'ORDER BY ' + col + ' ' + o.type + (sub ? sub_message : '') + ' is ' + diff_type + '.';
    } else if (o.expr.type === 'aggr_func') {
      // v args.expr moze byt columnRef kde table === null
      message2 += 'ORDER BY ' + o.expr.name + '(...) ' + o.type + (sub ? sub_message : '') + ' is ' + diff_type + '.';
    } else if (o.expr.type === 'binary_expr') {
      let x = o.expr as MyExprHaving;
      let left: string | undefined;
      let right: string | undefined;
      if ('left' in o.expr && 'right' in o.expr && 'operator' in o.expr) {
        if (x.left.type === 'column_ref')
          left = x.left.table === null ? x.left.column : x.left.table + '.' + x.left.column;
        else if (x.left.type === 'aggr_func') {
          if (x.left.args.expr.type === 'column_ref') {
            left =
              x.left.name + '(' + x.left.args.expr.table === null
                ? x.left.args.expr.column + ')'
                : x.left.args.expr.table + '.' + x.left.args.expr.column + ')';
          } else left = x.left.name + '(...)';
        }
        if (x.right.type === 'column_ref')
          right = x.right.table === null ? x.right.column : x.right.table + '.' + x.right.column;
        else if (x.right.type === 'aggr_func') {
          if (x.right.args.expr.type === 'column_ref') {
            right =
              x.right.name + '(' + x.right.args.expr.table === null
                ? x.right.args.expr.column + ')'
                : x.right.args.expr.table + '.' + x.right.args.expr.column + ')';
          } else right = x.right.name + '(...)';
        }
        if (left !== undefined && right !== undefined) {
          message2 +=
            'ORDER BY (' +
            left +
            ' ' +
            o.expr.operator +
            ' ' +
            right +
            ') ' +
            o.type +
            (sub ? sub_message : '') +
            ' is ' +
            diff_type +
            '.';
        } else if (left === undefined && right !== undefined) {
          message2 +=
            'ORDER BY (... ' +
            o.expr.operator +
            ' ' +
            right +
            ') ' +
            o.type +
            (sub ? sub_message : '') +
            ' is ' +
            diff_type +
            '.';
        } else if (left !== undefined && right == undefined) {
          message2 +=
            'ORDER BY (' +
            left +
            ' ' +
            o.expr.operator +
            ' ...) ' +
            o.type +
            (sub ? sub_message : '') +
            ' is ' +
            diff_type +
            '.';
        } else if (left === undefined && right === undefined) {
          message2 +=
            'ORDER BY (... ' +
            o.expr.operator +
            ' ...) ' +
            o.type +
            (sub ? sub_message : '') +
            ' is ' +
            diff_type +
            '.';
        }
      } else {
        message2 =
          'An unknown object has been found in the ORDER BY statement' +
          (sub ? sub_message : '') +
          '. Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
      }
    }
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the ORDER BY statement' +
      (sub ? sub_message : '') +
      '. Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
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
    recommendation: [] as string[],
  };
  console.log('OU FUCK:');
  console.dir(obj, { depth: null });
  let sub_message = ' the nested query in the ' + parent_query_statement?.toUpperCase() + ' statement';
  let diff_message = diff_type === 'missing' ? 'less' : 'more';
  let message0 = 'Expecting more/less rows to be returned by' + (sub ? sub_message + '.' : ' a query.');
  let message1 =
    'LIMIT statement' +
    (sub ? ' of' + sub_message : '') +
    ' is ' +
    diff_type +
    ' or is returning more/less rows than expected.';
  let message2 = '';
  if (
    'value' in obj &&
    obj.value !== null &&
    ((Array.isArray(obj.value) && obj.value.length > 0 && 'type' in obj.value[0] && obj.value[0].type === 'number') ||
      ('type' in obj.value && obj.value.type === 'number'))
  ) {
    let val: number;
    if (Array.isArray(obj.value)) val = obj.value[0].value;
    else val = obj.value.value;
    message2 =
      'LIMIT ' +
      val +
      ' statement' +
      (sub ? ' of' + sub_message : '') +
      ' is ' +
      diff_type +
      ' or is returning more/less rows than expected.';
  } else {
    message2 =
      'Unfortunately, the capabilities of this recommendation system are limited. Condition used in the LIMIT statement' +
      (sub ? sub_message : '') +
      ' is too complex. Feel free to report this as bug, stating the chapter name, exercise number ' +
      'and your query. Thank you! Your help is much appreciated.';
  }
  rec.recommendation.push(message0, message1, message2);
  return rec;
};

const generateInsertTableRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'INSERT',
    statement: 'TABLE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };
  if ('db' in obj && 'table' in obj) {
    let message0 = 'Make sure you are inserting into the correct table.';
    let message1 = obj.table + ' table is ' + diff_type + ' in the INSERT INTO statement.';
    let message2 = 'INSERT INTO ' + obj.table + ' is ' + (diff_type === 'missing' ? diff_type : 'incorrect') + '.';
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the INSERT INTO <table> statement.' +
      ' Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
  return rec;
};
const generateInsertColumnsRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'INSERT',
    statement: 'COLUMNS',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };
  console.log('Creating INSERT-COLUMNS recommendations for: ', obj);
  if (Array.isArray(obj)) {
    let message0 =
      'Make sure the INSERT INTO statement includes ' +
      (diff_type === 'missing' ? 'ALL' : 'ONLY') +
      ' the required columns.';
    let message1 =
      (diff_type === 'missing' ? 'Missing' : 'Redundant') +
      ' columns in the INSERT INTO table(col_1, col_2, ..., col_x) statement.';
    let message2 = (diff_type === 'missing' ? 'Missing' : 'Redundant') + ' column/s: ';
    for (let col of obj) message2 += col + ', ';
    message2 = message2.slice(0, -2) + ' in the INSERT INTO table(...) statement.';
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the INSERT INTO table(column_1, column_2, ..., column_x) statement' +
      '. Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
  return rec;
};
const generateInsertValuesRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'INSERT',
    statement: 'VALUES',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };
  if (obj !== null && 'type' in obj && 'value' in obj) {
    let diff_message = diff_type === 'missing' ? 'ALL' : 'ONLY';
    let message0 = 'Make sure you are inserting ' + diff_message + ' the required values.';
    let message1 = 'VALUES statement contains incorrect values.';
    let message2 = "VALUES statement is missing value '" + obj.value + "'.";
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the INSERT INTO ... VALUES statement.' +
      ' Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
  return rec;
};

const generateUpdateTableRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'UPDATE',
    statement: 'TABLE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };
  if ('db' in obj && 'table' in obj) {
    let message0 = 'Make sure you are updating the correct table.';
    let message1 = obj.table + ' table is ' + diff_type + ' in the UPDATE statement.';
    let message2 = 'UPDATE ' + obj.table + ' is ' + (diff_type === 'missing' ? diff_type : 'incorrect') + '.';
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the UPDATE table statement.' +
      ' Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
  return rec;
};
const generateUpdateSetRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'UPDATE',
    statement: 'SET',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };
  if ('column' in obj && 'value' in obj && 'table' in obj) {
    let message0 = 'Make sure you are setting the correct values and columns in the UPDATE statement.';
    let message1 = 'SET ' + obj.column + ' is ' + diff_type + ' in the UPDATE statement.';
    let val = '';
    if (typeof obj.value === 'object') {
      if ('value' in obj.value && (typeof obj.value.value === 'number' || typeof obj.value.value === 'string'))
        val = obj.value.value;
    }
    let message2 =
      'SET ' +
      obj.column +
      ' = ' +
      (val === '' ? '...' : val) +
      ' is ' +
      diff_type +
      ' or contains invalid values in the UPDATE statement.';
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the UPDATE .. SET .. statement.' +
      ' Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
  return rec;
};
const generateUpdateWhereRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'UPDATE',
    statement: 'WHERE',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };

  let type: string | undefined;
  let operator: string | undefined;
  let left: ASTObject | undefined;
  let right: ASTObject | undefined;
  for (let [key, value] of Object.entries(obj)) {
    if (key === 'type') type = value;
    else if (key === 'operator') operator = value;
    else if (key === 'left') left = value;
    else if (key === 'right') right = value;
  }
  // if (type === undefined && operator === undefined && left === undefined && right === undefined) {
  //   let message =
  //     'An unknown object has been found in the UPDATE .. WHERE statement.' +
  //     ' Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
  //   rec.recommendation.push(message, message, message);
  // } else {
  //   let message0: string = 'Make sure the condition in the WHERE statement is correct.',
  //     message1: string = '',
  //     message2: string = '';
  //   if (operator !== undefined && left === undefined && right === undefined) {
  //     message1 = 'Try using different operator in the condition of your WHERE statement.';
  //     message2 = "Operator '... " + operator + " ...' is " +
  //       (diff_type === 'missing' ? diff_type : 'incorrect') +
  //       ' in the condition of your WHERE statement.';
  //   } else if (operator === undefined && left !== undefined && right === undefined) {
  //     // iba left
  //     let l_val: string | undefined;
  //     message1 = 'Left side of the condition in the WHERE statement is incorrect.';
  //     //moze byt column_ref, binary_exp, aggr_func
  //     if ('type' in left) {
  //       if (left.type === 'column_ref') {

  //       } else if (left.type === 'binary_exp') {

  //       } else if (left.type === 'aggr_func') {
  //         if ('name' in left) {
  //           l_val = left.name;
  //           if ('args' in left && 'expr' in left.args) {
  //             if ()
  //           }
  //         }
  //       } else if ('value'in left) l_val = left.value;
  //     } else {
  //       if ('column' in left) {
  //         if ('table' in left) l_val = left.table === null ? left.column : left.table + '.' + left.column;
  //         else l_val = left.column;
  //       } else if ('value' in left) {
  //         l_val = left.value;
  //       }
  //     }
  //     if(l_val !== undefined) {
  //       message2 = '';
  //     }
  //   } else if (operator === undefined && left === undefined && right !== undefined) {
  //     // iba right
  //   } else if (operator !== undefined && left !== undefined && right === undefined) {
  //     //operator + left
  //   } else if (operator !== undefined && left === undefined && right !== undefined) {
  //     //operator + right
  //   } else if (operator === undefined && left !== undefined && right !== undefined) {
  //     //left + right
  //   } else if (operator !== undefined && left !== undefined && right !== undefined) {
  //     //vsetko
  //   }
  //   if(message2 === '') {
  //     //lutujem, ale nemam viac info
  //   }
  //   rec.recommendation.push(message0, message1, message2);
  // }
  // if ('type' in obj && 'operator' in obj && 'left' in obj && 'right' in obj) {
  //   let o = obj as MyExpr;
  //   message0 = 'Make sure the condition in the WHERE statement is correct.';
  //   message1 =
  //     "Condition using '" +
  //     o.operator +
  //     "' operator is probably " +
  //     diff_type +
  //     ' in the WHERE statement' +
  //     (sub ? sub_message : '') +
  //     '.';
  //   if (o.left.type === 'column_ref' && o.right.type === 'column_ref') {
  //     let l_col = o.left.table === null ? o.left.column : o.left.table + '.' + o.left.column;
  //     let r_col = o.right.table === null ? o.right.column : o.right.table + '.' + o.right.column;
  //     message2 =
  //       "Condition '" +
  //       l_col +
  //       ' ' +
  //       o.operator +
  //       ' ' +
  //       r_col +
  //       "' in the WHERE statement" +
  //       (sub ? sub_message : '') +
  //       ' is probably ' +
  //       diff_type +
  //       '.';
  //   } else if (o.left.type !== 'column_ref' && o.right.type === 'column_ref') {
  //     let r_col = o.right.table === null ? o.right.column : o.right.table + '.' + o.right.column;
  //     message2 =
  //       "Condition '... " +
  //       o.operator +
  //       ' ' +
  //       r_col +
  //       "' in the WHERE statement" +
  //       (sub ? sub_message : '') +
  //       ' is probably ' +
  //       diff_type +
  //       '.';
  //   } else if (o.left.type === 'column_ref' && o.right.type !== 'column_ref') {
  //     let l_col = o.left.table === null ? o.left.column : o.left.table + '.' + o.left.column;
  //     message2 =
  //       "Condition '" +
  //       l_col +
  //       ' ' +
  //       o.operator +
  //       " ...' in the WHERE statement" +
  //       (sub ? sub_message : '') +
  //       ' is probably ' +
  //       diff_type +
  //       '.';
  //   } else {
  //     message2 =
  //       'Unfortunately, the capabilities of this recommendation system are limited. Condition used in the WHERE statement' +
  //       (sub ? sub_message : '') +
  //       ' is too complex. Feel free to report this as bug, stating the chapter name, exercise number ' +
  //       'and your query. Thank you! Your help is much appreciated.';
  //   }
  //   rec.recommendation.push(message0, message1, message2);
  // }

  return rec;
};

const generateDeleteFromRecommendations = (obj: ASTObject, diff_type: string): Recommendation => {
  let rec = {
    query_type: 'DELETE',
    statement: 'FROM',
    parent_query_type: undefined,
    parent_statement: undefined,
    recommendation: [] as string[],
  };
  if ('db' in obj && 'table' in obj) {
    let message0 = 'Make sure you are deleting from the correct table.';
    let message1 = obj.table + ' table is ' + diff_type + ' in the DELETE statement.';
    let message2 = 'DELETE FROM ' + obj.table + ' is ' + (diff_type === 'missing' ? diff_type : 'incorrect') + '.';
    rec.recommendation.push(message0, message1, message2);
  } else {
    let message =
      'An unknown object has been found in the INSERT INTO <table> statement.' +
      ' Please report this as bug, stating the chapter name, exercise number and your query. Thank you! Your help is much appreciated.';
    rec.recommendation.push(message, message, message);
  }
  return rec;
};
const generateDeleteWhereRecommendations = (
  obj: ASTObject,
  diff_type: string,
  sub: boolean,
  parent_query_type: string | undefined,
  parent_query_statement: string | undefined
): Recommendation => {
  let rec = {
    query_type: 'DELETE',
    statement: 'WHERE',
    parent_query_type: parent_query_type?.toUpperCase(),
    parent_statement: parent_query_statement?.toUpperCase(),
    recommendation: [] as string[],
  };
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
      if (key === 'table') {
        if (Array.isArray(value) && value.length > 0) {
          for (let [v_key, v_val] of Object.entries(value)) {
            recs.push(generateUpdateTableRecommendations(v_val, diff_type));
          }
        } else recs.push(generateUpdateTableRecommendations(value, diff_type));
      } else if (key === 'set') {
        if (Array.isArray(value) && value.length > 0) {
          for (let [v_key, v_val] of Object.entries(value)) {
            if (typeof v_val === 'object' && v_val !== null) {
              if ('ast' in v_val) {
                const subAST = v_val['ast'] as ASTObject;
                recommender(subAST, diff_type, recs, 'select', 'update', 'set');
              } else recs.push(generateUpdateSetRecommendations(v_val, diff_type));
            }
          }
        } else recs.push(generateUpdateSetRecommendations(value, diff_type));
      } else if (key === 'where') {
      }
    } else if (query_type === 'delete') {
      if (key === 'from') {
        if (Array.isArray(value) && value.length > 0) {
          for (let [v_key, v_val] of Object.entries(value)) {
            recs.push(generateDeleteFromRecommendations(v_val, diff_type));
          }
        } else recs.push(generateDeleteFromRecommendations(value, diff_type));
      } else if (key === 'where') {
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

const generateGeneralRecommendation = (queryType: string, branch: string, diff_type: string): string => {
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
      return (
        'Apparently, it is needed to use nested query in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase()) +
        ' statement. Here are some examples:\n' +
        s
      );
    } else if (diff_type === 'redundant') {
      return (
        'Unfortunately, there is no known solution that uses nested query in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase()) +
        ' statement. Apparently, this exercise can be solved without using nested query.'
      );
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
      return (
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase()) +
        ' statement. Here are some examples:\n' +
        s
      );
    }
  } else if (queryType === 'insert') {
    if (diff_type === 'missing') {
      return (
        'Apparently, it is needed to use nested query in the VALUES / SELECT statement. Here are some examples:\n' +
        'INSERT INTO ... VALUES (<values>, (SELECT ... nested query), <values>);\n' +
        'INSERT INTO ... SELECT <values>, (SELECT ... nested query), <values>;'
      );
    } else if (diff_type === 'redundant') {
      return (
        'Unfortunately, there is no known solution that uses nested query in the VALUES / SELECT statement. Apparently, ' +
        'this exercise can be solved without using nested query.'
      );
    } else {
      return (
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in different statement. Here are some examples:\n' +
        'INSERT INTO ... VALUES (<values>, (SELECT ... nested query), <values>);\n' +
        'INSERT INTO ... SELECT <values>, (SELECT ... nested query), <values>;'
      );
    }
  } else if (queryType === 'update') {
    if (diff_type === 'missing') {
      return (
        'Apparently, it is needed to use nested query in the ' +
        branch.toUpperCase() +
        ' statement. Here are some examples:\n' +
        (branch === 'set'
          ? 'UPDATE ... SET <column_name> = (SELECT ... nested query)\n' +
            'UPDATE ... SET <column_name> = (SELECT ... nested query) WHERE ...'
          : 'UPDATE ... SET ... WHERE (SELECT ... nested query) <operator> <operand>\n' +
            'UPDATE ... SET ... WHERE <operand> <operator> (SELECT ... nested query)')
      );
    } else if (diff_type === 'redundant') {
      return (
        'Unfortunately, there is no known solution that uses nested query in the ' +
        branch +
        ' statement. Apparently, this exercise can be solved without using nested query.'
      );
    } else {
      return (
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in ' +
        branch.toUpperCase() +
        ' statement. Here are some examples:\n' +
        (branch === 'set'
          ? 'UPDATE ... SET <column_name> = (SELECT ... nested query)\n' +
            'UPDATE ... SET <column_name> = (SELECT ... nested query) WHERE ...'
          : 'UPDATE ... SET ... WHERE (SELECT ... nested query) <operator> <operand>\n' +
            'UPDATE ... SET ... WHERE <operand> <operator> (SELECT ... nested query)')
      );
    }
  } else if (queryType === 'delete') {
    if (diff_type === 'missing') {
      return (
        'Apparently, it is needed to use nested query in the WHERE statement. Here are some examples:\n' +
        'DELETE FROM ... WHERE <operand> <operator> (SELECT ... nested query);\n' +
        'DELETE FROM ... WHERE (SELECT ... nested query) <operator> <operand>;'
      );
    } else if (diff_type === 'redundant') {
      return (
        'Unfortunately, there is no known solution that uses nested query in the WHERE statement. Apparently, ' +
        'this exercise can be solved without using nested query.'
      );
    } else {
      return (
        'Unfortunately, there is no known solution that uses nested query in the same statement as you did. ' +
        'However, it appears nested query is needed to solve this exercise. Try using it in different statement. Here are some examples:\n' +
        'DELETE FROM ... WHERE <operand> <operator> (SELECT ... nested query);\n' +
        'DELETE FROM ... WHERE (SELECT ... nested query) <operator> <operand>;'
      );
    }
  }
  return '';
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
): Recommendations => {
  let recs: Recommendation[] = [];
  let generalRecommendation: string = '';

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
        // console.log('MISSING GENERAL RECOMMENDATION:', generalRecommendation);
      }
    } else if (missing_asts === null && extras_asts !== null) {
      const extrasUnmodifiedAST = checkUnmodifiedASTs(extras_asts);
      if (extrasUnmodifiedAST !== null) {
        const key = Object.keys(extrasUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; extras ast value:', extrasUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'redundant');
        // console.log('EXTRAS GENERAL RECOMMENDATION:', generalRecommendation);
      }
    } else if (missing_asts !== null && extras_asts !== null) {
      const missingUnmodifiedAST = checkUnmodifiedASTs(missing_asts);
      const extrasUnmodifiedAST = checkUnmodifiedASTs(extras_asts);
      if (missingUnmodifiedAST !== null && extrasUnmodifiedAST === null) {
        const key = Object.keys(missingUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; missing ast value:', missingUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'missing');
        // console.log('MISSING GENERAL RECOMMENDATION:', generalRecommendation);
      } else if (missingUnmodifiedAST === null && extrasUnmodifiedAST !== null) {
        const key = Object.keys(extrasUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; extras ast value:', extrasUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'redundant');
        // console.log('EXTRAS GENERAL RECOMMENDATION:', generalRecommendation);
      } else if (missingUnmodifiedAST !== null && extrasUnmodifiedAST !== null) {
        const key = Object.keys(missingUnmodifiedAST)[0];
        // console.log('queryType:', queryType, ';', 'parent:', key, '; missing ast value:', missingUnmodifiedAST[key]);
        generalRecommendation = generateGeneralRecommendation(queryType, key, 'both');
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

  console.log('General recommendation:', generalRecommendation);
  recs = removeDuplicateRecommendations(recs);
  console.log('recs:');
  console.dir(recs, { depth: null });
  let result: Recommendations = {
    default_detail_level: cluster,
    generalRecommendation: generalRecommendation,
    recommendations: recs,
  };
  return result;
};
