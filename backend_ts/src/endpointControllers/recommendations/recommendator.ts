import { AggrFunc, Column, ColumnRef, Star } from 'node-sql-parser';
import { ASTObject } from '../ast/lexicalAnalysis/analyzer';

interface Recommendation {
  type: string;
  recommendation: string[];
}

export interface Recommendations {
  default_detail_level: number;
  recommendations: Recommendation[];
}

interface myArgs {
  expr: ColumnRef | Star;
}

const checkIfSubASTisModified = (ast: ASTObject): boolean => {
//   //   const keys_select = [
//   //     'with',
//   //     'options',
//   //     'distinct',
//   //     'columns',
//   //     'into',
//   //     'from',
//   //     'where',
//   //     'groupby',
//   //     'having',
//   //     'orderby',
//   //     'limit',
//   //     'window',
//   //   ];
//   //   const keys_insert = ['table', 'columns', 'values', 'partition', 'returning'];
//   //   const keys_update = ['table', 'set', 'where', 'returning'];
//   //   const keys_delete = ['table', 'from', 'where'];
//   //   const type = ast.type;
//   //   if (type === undefined) return true;
//   //   return false;
  return ast.type === undefined;
//   //   const keys =
//   //     type === 'select' ? keys_select : type === 'insert' ? keys_insert : type === 'update' ? keys_update : keys_delete;
//   //   for (let k of keys) {
//   //     console.log(k);
//   //     if (!(k in ast)) return true;
//   //   }
//   //   return false;
};

const generateColumnsRecommendationsForSelect = (
  obj: Column,
  diff_type: string,
  sub: boolean,
  branch: string
): Recommendation => {
  console.log('generating SELECT recommendations for obj:');
  console.dir(obj, { depth: null });
  let o;
  let rec = {
    type: 'SELECT',
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
          const args = o.args as unknown as myArgs;
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
          const args = o.args as unknown as myArgs;
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

const generateFromRecommendations = (sub: boolean) => {};
const generateWhereRecommendations = (sub: boolean) => {};
const generateGroupByRecommendations = (sub: boolean) => {};
const generateHavingRecommendations = (sub: boolean) => {};
const generateOrderByRecommendations = (sub: boolean) => {};
const generateLimitRecommendations = (sub: boolean) => {};

const isSubQuery = (value: any): boolean => {
  return typeof value === 'object' && value !== null && 'ast' in value;
};

const recommender = (
  diff: ASTObject,
  diff_type: string,
  recs: Recommendation[],
  sub: boolean,
  branch: string | undefined
) => {
  //   console.log('Checking:', diff_type, '; sub:', sub);
  for (let [key, value] of Object.entries(diff)) {
    // console.log(key, ':', value);
    if (key === 'columns') {
      // if SELECT / INSERT
      for (let [col_key, col_val] of Object.entries(diff[key])) {
        if (typeof col_val === 'object' && col_val !== null && 'ast' in col_val) {
          const subAST = col_val['ast'] as ASTObject;
          recommender(subAST, diff_type, recs, true, 'SELECT');
        } else recs.push(generateColumnsRecommendationsForSelect(col_val as Column, diff_type, sub, branch as string));
      }
    }
  }
};

const checkIfContainsSubAST = (obj: ASTObject): [ASTObject] | ASTObject | null => {
    // TODO: overit ci to spravne hlada AST a ci spravne najde viacero AST
  let asts: ASTObject[] = [];
  for (let [key, value] of Object.keys(obj)) {
    if (typeof value === 'object' && value !== null && 'ast' in value) asts.push(value);
  }
  if (asts.length === 1) return asts[0];
  else if (asts.length > 1) return asts;
  else return null;
};

const sortRecommendations = (recs: Recommendation[]): Recommendation[] => {
  let newRecs: Recommendation[] = [];
  return newRecs;
};

export const createRecommendations = (missing: ASTObject, extras: ASTObject, cluster: number): Recommendations => {
  let recs: Recommendation[] = [];

  let missing_asts; //= checkIfContainsSubAST(missing);
  let extras_asts; //= checkIfContainsSubAST(extras);

  if (Object.keys(missing).length > 0 && Object.keys(extras).length === 0) {
    missing_asts = checkIfContainsSubAST(missing);
    /**
     * ak je to null, potom:
     *      a. stud: normal, sol: normal                                -> vytvorim odporucania
     *      b. stud: subQuery, sol: subQuery, ale subquery sa zhoduju   -> vytvorim odporucania
     * ak to nie je null, potom:
     *      a. ast je full -->      stud: normal, sol: subQuery         -> otestujem ako vyzera ked chyba cele AST
     *                                                                  -> vytvorim odporucanie, ktore povie: 
     *                                                                      "Skus pouzit subQuery vo vetve X.."
     *                                                                  -> nasledne vytvorim odporucania pre vnorene query
     *      b. ast nie je full -->  stud: subQuery, sol: subQuery, rovnake vetvy, ale studentovi v subQuery nieco chyba
     *                                                                  -> vytvorim odporucania
     */
  } else if (Object.keys(missing).length === 0 && Object.keys(extras).length > 0) {
    extras_asts = checkIfContainsSubAST(extras);
    /**
     * ak to je null, potom:
     *      a. stud: normal, sol: normal                                -> vytvorim odporucania
     *      b. stud: subQuery, sol: subQuery, ale subquery sa zhoduju   -> vytvorim odporucania
     * ak to nie je null, potom:
     *      a. ast je full -->      stud: subQuery, sol: normal         -> vytvorim odporucanie, ktore povie:
     *                                                                      "Ulohu je mozne vyriesit bez pouzitia subQuery" alebo
     *                                                                      ak student ma 2 subquery a sol ma iba jedno
     *                                                                      "Ulohu je mozne vyriesit bez subquery vo vetve X"
     *                                                                  -> TOTO JE NAJHORSI MOZNY PRIPAD, pretoze budem studenta
     *                                                                     navadzat aby komplet prepisal svoje riesenie
     *      b. ast nie je full -->  stud: subQuery, sol: subQuery, rovnake vetvy, ale student ma v subQuery nieco navyse
     *                                                                  -> vytvorim odporucania
     */
  } else if (Object.keys(missing).length > 0 && Object.keys(extras).length > 0) {
    missing_asts = checkIfContainsSubAST(missing);
    extras_asts = checkIfContainsSubAST(extras);
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
     *                                                     "Ulohu je mozne vyriesit bez pouzitia subquery vo vetve X" + odporucania
     *      b. ziadne nie je full                       -> v subqueries ma nieco navyse, takze vytvorim odporucania
     * ani jedno nie je null:
     *      a. ani jedno nie je full                    -> v subqueries ma nieco navyse/nieco chyba, takze vytvorim odporucania
     *      b. iba missing ma aspon jedno full          -> chyba mu cele subquery vo vetve X, cize
     *                                                     "Skus pouzit subquery vo vetve x" + vytvorim odporucania
     *      c. iba extras ma aspon jedno full           -> DALSI NAJHORSI PRIPAD
     *                                                     "Ulohu je mozne vyriesit bez pouzitia subquery vo vetve X" + odporucania
     *      d. ziadne nema aspon jedno full             -> nieco mu chyba, nieco ma navyse... cize vytvorim odporucania
     */
  }

  //   if (missing_asts === null && extras_asts === null) {

  //   }

  /**
   * oboje su null ->           stud: normal, sol: normal
   * missing nie je null ->     stud: normal, sol: subQuery
   * extras nie je null ->      stud: subQuery, sol: normal
   * oboje nie su null ->       stud: subQuery, sol: subQuery (tu je este rozdiel ci su to rovnake alebo rozdielne vetvy)
   */

  if (Object.keys(missing).length > 0) {
    console.log('Creating recommendations for missing objects');
    recommender(missing, 'missing', recs, false, undefined);
  }
  if (Object.keys(extras).length > 0) {
    console.log('Creating recommendations for extras objects');
    recommender(extras, 'extra', recs, false, undefined);
  }

  console.log('recs:');
  console.dir(recs, { depth: null });
  let result: Recommendations = {
    default_detail_level: cluster,
    recommendations: recs,
  };
  return result;
};

/** diff = missing, diff_type = 'missing', cluster = 0
 * missing: {
      columns: [
        {
          ast: {
            columns: [
              {
                type: 'expr',
                expr: {
                  type: 'column_ref',
                  table: 'FACILITIES',
                  column: 'MEMBERCOST',
                },
                as: null,
              },
            ],
          },
        },
      ],
    },
 */
