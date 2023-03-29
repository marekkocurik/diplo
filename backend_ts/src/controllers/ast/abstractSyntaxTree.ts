import {
  getSolutions,
  getTableNamesAliasesAndColumnsFromQuery,
  replaceAsterixWithTableAndColumns,
  replaceTableAliasesWithTableName,
  specifyColumnsWithoutTables,
  updateSolutionToUpperCase,
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

export const getAST = async (request: any, reply: any) => {
  let { query } = request.query;
  if (query[query.length - 1] === ';') query = query.slice(0, -1);
  // let [code, resp] = await getTableNamesAliasesAndColumnsFromQuery(query);
  // let newQuery = replaceTableAliasesWithTableName(query, resp.tac);
  // console.log(newQuery);
  // let _newQuery = replaceAsterixWithTableAndColumns(newQuery, resp.tac);
  // console.log(_newQuery);

  // TODO: treba otestovat pre vsetky query v solutions
  // TODO: treba porozmyslat ako odstranit aliasy stlpcov (aktualne m.memid as memid zmeni na MEMBERS.MEMID AS MEMBERS.MEMID)

  let [solCode, solResult] = await getSolutions();
  if (solCode !== 200) {
    reply.code(solCode).send(solResult);
    return;
  }
  // let response: queryWithTAC[] = [];
  let response: queryCompare[] = []
  for (let s of solResult.solutions) {
    console.log('query: ', s.query);
    let [TACCode, TACResult] = await getTableNamesAliasesAndColumnsFromQuery(s.query);
    if (TACCode !== 200) {
      reply.code(TACCode).send({ message: 'Failed to obtain TAC for query: ' + s.query });
      return;
    }
    // console.log('TACResult: query: ' + s.query, '; TAC:', TACResult.tac);
    let updated = replaceTableAliasesWithTableName(s.query, TACResult.tac);
    updated = replaceAsterixWithTableAndColumns(updated, TACResult.tac);
    updated = specifyColumnsWithoutTables(updated, TACResult.tac);
    // response.push({ query: s.query, tac: TACResult.tac });
    response.push({ origin: s.query, normalized: updated});
  }
  // console.log(result.tac);
  // console.log(solResult.solutions);

  reply.code(200).send({ message: 'ok', response });
  return;
};
