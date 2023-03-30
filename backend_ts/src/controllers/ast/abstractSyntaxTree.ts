import {
  getSolutions,
  getTableNamesAliasesAndColumnsFromQuery,
  replaceAsterixWithTableAndColumns,
  replaceTableAliasesWithTableName,
  specifyColumnsWithoutTables,
  removeTableAliases,
  removeColumnAliases,
  updateSolutionToUpperCase,
  queryToUpperCase,
} from './lexicalAnalysis/analyzer';

interface TableWithAliasAndColumns {
  table: string;
  as: string | null;
  columns: string[];
}

interface queryWithTAC {
  query: string;
  tac: TableWithAliasAndColumns[];
}

interface queryCompare {
  origin: string;
  normalized: string;
}

const test = async (response: queryCompare[], query: string) => {
  let newQuery = queryToUpperCase(query);
  let [code, resp] = await getTableNamesAliasesAndColumnsFromQuery(newQuery);
  console.log(newQuery, '\n');
  newQuery = replaceTableAliasesWithTableName(newQuery, resp.tac);
  console.log('replaced table aliases with table names: ');
  console.log(newQuery, '\n');
  newQuery = replaceAsterixWithTableAndColumns(newQuery, resp.tac);
  console.log('replaced asterix with table and columns: ');
  console.log(newQuery, '\n');
  newQuery = specifyColumnsWithoutTables(newQuery, resp.tac);
  console.log('specified columns without tables: ');
  console.log(newQuery, '\n');
  newQuery = removeTableAliases(newQuery, resp.tac);
  console.log('removed table aliases: ');
  console.log(newQuery, '\n');
  newQuery = removeColumnAliases(newQuery, resp.tac);
  console.log('removed columns aliases: ');
  console.log(newQuery, '\n');
  response.push({ origin: query, normalized: newQuery });
};

const testAll = async (response: queryCompare[]): Promise<[number, Object]> => {
  let [solCode, solResult] = await getSolutions();
  if (solCode !== 200) return [solCode, solResult];
  for (let s of solResult.solutions) {
    // updateSolutionToUpperCase(s.id, s.query);
    // console.log('query: ', s.query);
    let [TACCode, TACResult] = await getTableNamesAliasesAndColumnsFromQuery(s.query);
    if (TACCode !== 200) return [TACCode, { message: 'Failed to obtain TAC for query: ' + s.query }];
    // console.log('TAC finished');
    // console.log('TACResult: query: ' + s.query, '; TAC:', TACResult.tac);
    let updated = replaceTableAliasesWithTableName(s.query, TACResult.tac);
    // console.log('Replaced table aliases with names');
    updated = replaceAsterixWithTableAndColumns(updated, TACResult.tac);
    // console.log('replaced asterix with tables and columns');
    updated = specifyColumnsWithoutTables(updated, TACResult.tac);
    // console.log('specified columns');
    updated = removeTableAliases(updated, TACResult.tac);
    updated = removeColumnAliases(updated, TACResult.tac);
    // response.push({ query: s.query, tac: TACResult.tac });
    response.push({ origin: s.query, normalized: updated });
  }
  // console.log(result.tac);
  // console.log(solResult.solutions);
  return [200, {}];
};

export const getAST = async (request: any, reply: any) => {
  let { query } = request.query;
  if (query[query.length - 1] === ';') query = query.slice(0, -1);

  // let response: queryWithTAC[] = [];
  let response: queryCompare[] = [];

  // await test(response, query);

  let [code, res] = await testAll(response);
  if (code !== 200) {
    reply.code(code).send(res);
    return;
  }

  // TODO: treba otestovat pre vsetky query v solutions
  // TODO: treba porozmyslat ako odstranit aliasy stlpcov (aktualne m.memid as memid zmeni na MEMBERS.MEMID AS MEMBERS.MEMID)
  // --------> mozno sa to da spravit cez AST->columns (tam su ulozene aliasy pre columns)

  reply.code(200).send({ message: 'ok', response });
  return;
};
