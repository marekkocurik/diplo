import { AggrFunc, Column, ColumnRef, Star } from 'node-sql-parser';
import { ASTObject } from '../ast/lexicalAnalysis/analyzer';
// import { aggr_func, select_stmt } from 'node-sql-parser/ast/postgresql';

interface Recommendation {
  query_type: string;
  statement: string;
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

interface MyArgs {
  expr: ColumnRef | Star;
}

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

const generateSelectColumnsRecommendations = (
  query_type: string,
  obj: Column,
  diff_type: string,
  sub: boolean,
  branch: string | undefined
): Recommendation => {
  console.log('generating SELECT recommendations for obj:');
  console.dir(obj, { depth: null });
  let o;
  let rec = {
    query_type: query_type,
    statement: 'SELECT',
    parent_statement: branch,
    recommendation: [] as string[],
  };

  if (!sub) {
    if (diff_type === 'missing') {
      if (obj.expr.type === 'column_ref') {
        o = obj.expr as ColumnRef;
        rec.recommendation.push(
          'Make sure the SELECT statement includes ALL the required columns and their required aliases.'
        );
        rec.recommendation.push(
          o.column + (obj.as ? ' AS ' + obj.as : '') + ' column is missing in the SELECT statement.'
        );
        rec.recommendation.push(
          (o.table as string) +
            '.' +
            o.column +
            (obj.as ? ' AS ' + obj.as : '') +
            ' column is missing in the SELECT statement.'
        );
      } else if (obj.expr.type === 'aggr_func') {
        // TODO: !SUB, MISSING, aggr_func
        o = obj.expr as AggrFunc;
        rec.recommendation.push(
          'Make sure the SELECT statement includes ALL the required aggregate functions and their required aliases.'
        );
        rec.recommendation.push(
          'Aggregate function ' +
            o.name +
            '(...)' +
            (obj.as ? ' AS ' + obj.as : '') +
            ' in the SELECT statement is missing or contains invalid values.'
        );
        if (o.args !== null) {
          const args = o.args as unknown as MyArgs;
          if (args.expr.type === 'column_ref') {
            rec.recommendation.push(
              'Aggregate function ' +
                o.name +
                '(' +
                (args.expr.table as string) +
                '.' +
                args.expr.column +
                ')' +
                (obj.as ? ' AS ' + obj.as : '') +
                ' is missing in the SELECT statement.'
            );
          } else if (args.expr.type === 'star') {
            rec.recommendation.push(
              'Aggregate function ' +
                o.name +
                '(*)' +
                (obj.as ? ' AS ' + obj.as : '') +
                ' is missing in the SELECT statement.'
            );
          }
          //   else if (o.args?.type === 'aggr_func') {
          //     rec.recommendation.push(
          //       'Aggregate function ' +
          //         o.name +
          //         '(' +
          //         o.args.name +
          //         '(...))' +
          //         (obj.as ? ' AS ' + obj.as : '') +
          //         ' is missing in the SELECT statement.'
          //     );
          //   }
        }
      }
    } else if (diff_type === 'extra') {
      if (obj.expr.type === 'column_ref') {
        o = obj.expr as ColumnRef;
        rec.recommendation.push('Make sure the SELECT statement includes ONLY the required columns.');
        rec.recommendation.push(
          o.column + (obj.as ? ' AS ' + obj.as : '') + ' column is redundant in the SELECT statement.'
        );
        rec.recommendation.push(
          (o.table as string) +
            '.' +
            o.column +
            (obj.as ? ' AS ' + obj.as : '') +
            ' column is redundant in the SELECT statement.'
        );
      } else if (obj.expr.type === 'aggr_func') {
        // TODO: !SUB, EXTRA, aggr_func
        o = obj.expr as AggrFunc;
        rec.recommendation.push(
          'Make sure the SELECT statement includes ONLY the required aggregate functions and their required aliases.'
        );
        rec.recommendation.push(
          'Aggregate function ' +
            o.name +
            '(...)' +
            (obj.as ? ' AS ' + obj.as : '') +
            ' in the SELECT statement is redundant or contains invalid values.'
        );
        if (o.args !== null) {
          const args = o.args as unknown as MyArgs;
          if (args.expr.type === 'column_ref') {
            rec.recommendation.push(
              'Aggregate function ' +
                o.name +
                '(' +
                (args.expr.table as string) +
                '.' +
                args.expr.column +
                ')' +
                (obj.as ? ' AS ' + obj.as : '') +
                ' is redundant in the SELECT statement.'
            );
          } else if (args.expr.type === 'star') {
            rec.recommendation.push(
              'Aggregate functioo ' +
                o.name +
                '(*)' +
                (obj.as ? ' AS ' + obj.as : '') +
                ' is redundant in the SELECT statement.'
            );
          }
          //   else if (o.args?.type === 'aggr_func') {
          //     rec.recommendation.push(
          //       'Aggregate function ' +
          //         o.name +
          //         '(' +
          //         o.args.name +
          //         '(...))' +
          //         (obj.as ? ' AS ' + obj.as : '') +
          //         ' is redundant in the SELECT statement.'
          //     );
          //   }
        }
      }
    }
  } else if (sub) {
    // TODO: toto som este nekontroloval
    if (diff_type === 'missing') {
      if (obj.expr.type === 'column_ref') {
        o = obj.expr as ColumnRef;
        rec.recommendation.push(
          'Make sure the SELECT statement of the NESTED QUERY in the ' +
            branch +
            ' statement includes ALL the required columns.'
        );
        rec.recommendation.push(
          o.column + ' column is missing in the ' + branch + ' statement of the NESTED QUERY in the SELECT statement.'
        );
        rec.recommendation.push(
          (o.table as string) +
            '.' +
            o.column +
            ' column is missing in the ' +
            branch +
            ' statement of the NESTED QUERY in the SELECT statement.'
        );
      } else {
        // TODO: SUB, MISSING, aggr_func
        o = obj.expr as AggrFunc;
      }
    } else {
      if (obj.expr.type === 'column_ref') {
        o = obj.expr as ColumnRef;
        rec.recommendation.push(
          'Make sure the SELECT statement of the NESTED QUERY in the ' +
            branch +
            ' statement includes ONLY the required columns.'
        );
        rec.recommendation.push(
          o.column + ' column is redundant in the ' + branch + ' statement of the NESTED QUERY in the SELECT statement.'
        );
        rec.recommendation.push(
          (o.table as string) +
            '.' +
            o.column +
            ' column is redundant in the ' +
            branch +
            ' statement of the NESTED QUERY in the SELECT statement.'
        );
      } else {
        // TODO: SUB, EXTRA, aggr_func
        o = obj.expr as AggrFunc;
      }
    }
  }
  return rec;
};

const generateSelectDistinctRecommendations = () => {};
const generateSelectFromRecommendations = (sub: boolean) => {};
const generateSelectWhereRecommendations = (sub: boolean) => {};
const generateSelectGroupByRecommendations = (sub: boolean) => {};
const generateSelectHavingRecommendations = (sub: boolean) => {};
const generateSelectOrderByRecommendations = (sub: boolean) => {};
const generateSelectLimitRecommendations = (sub: boolean) => {};

const generateInsertTableRecommendations = () => {};
const generateInsertColumnsRecommendations = () => {};
const generateInsertValuesRecommendations = () => {};

const generateUpdateTableRecommendations = () => {};
const generateUpdateSetRecommendations = () => {};
const generateUpdateWhereRecommendations = () => {};

// const generateDeleteTableRecommendations = () => {};
const generateDeleteFromRecommendations = () => {};
const generateDeleteWhereRecommendations = () => {};

const recommender = (
  query_type: string,
  diff: ASTObject,
  diff_type: string,
  recs: Recommendation[],
  sub: boolean,
  branch: string | undefined
) => {
  //   console.log('Checking:', diff_type, '; sub:', sub);
  for (let [key, value] of Object.entries(diff)) {
    // console.log(key, ':', value);
    if (query_type === 'select') {
      if (key === 'columns') {
        // value === Array? value === object?
        for (let [col_key, col_val] of Object.entries(value)) {
          if (typeof col_val === 'object' && col_val !== null && 'ast' in col_val) {
            const subAST = col_val['ast'] as ASTObject;
            recommender(query_type, subAST, diff_type, recs, true, branch ? branch : 'SELECT');
          } else recs.push(generateSelectColumnsRecommendations(query_type, col_val as Column, diff_type, sub, branch));
        }
      }
    } else if (query_type === 'insert') {
    } else if (query_type === 'update') {
    } else if (query_type === 'delete') {
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

const sortRecommendations = (recs: Recommendation[]): Recommendation[] => {
  let newRecs: Recommendation[] = [];
  return newRecs;
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
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase) +
        ' statement. Here are some examples:\n' +
        s
      );
    } else if (diff_type === 'redundant') {
      return (
        'Unfortunately, there is no known solution that uses nested query in the ' +
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase) +
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
        (branch === 'columns' ? 'SELECT' : branch.toUpperCase) +
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
        branch.toUpperCase +
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
        branch.toUpperCase +
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
    recommender(queryType, missing, 'missing', recs, false, undefined);
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
    recommender(queryType, extras, 'redundant', recs, false, undefined);
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
    recommender(queryType, missing, 'missing', recs, false, undefined);
    recommender(queryType, extras, 'redundant', recs, false, undefined);
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

  console.log('recs:');
  console.dir(recs, { depth: null });
  // TODO: sortnut odporucania
  let result: Recommendations = {
    default_detail_level: cluster,
    generalRecommendation: generalRecommendation,
    recommendations: recs,
  };
  return result;
};
