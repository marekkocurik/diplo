import TableController from '../../../database/tableController';
const { Parser } = require('node-sql-parser/build/postgresql');

const parser = new Parser();
const opt = { database: 'PostgresQL' };
const tableController = new TableController();

interface ASTObject {
  [key: string]: any;
}

interface TableWithAlias {
  table: string;
  as: string | null;
}

interface TableWithAliasAndColumns extends TableWithAlias {
  columns: string[];
}

interface TACResponse {
  message: string;
  tac: TableWithAliasAndColumns[];
}

interface Solutions {
  message: string;
  solutions: {
    id: number;
    query: string;
  }[];
}

export const updateSolutionToUpperCase = async (id: number, query: string): Promise<[number, Object]> => {
  try {
    let [code, result] = await tableController.updateSolutionToUpperCase(id, (query as string).toUpperCase());
    return [code, result];
  } catch (error) {
    return [500, { message: 'Something went wrong while trying to update query_id: ', id }];
  }
};

export const getSolutions = async (): Promise<[number, Solutions]> => {
  let [code, response] = await tableController.getAllSolutions();
  return [code, response];
};

const getTablesAndAliasesFromASTObject = (obj: ASTObject): TableWithAlias[] => {
  let results: TableWithAlias[] = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if ('table' in obj[key]) {
        results.push({
          table: obj[key].table,
          as: obj[key].as,
        });
      }
      results = [...results, ...getTablesAndAliasesFromASTObject(obj[key])];
    }
  }
  return results;
};

const getTablesAndAliasesFromAST = (ast: ASTObject): TableWithAlias[] => {
  let twa: TableWithAlias[] = [];
  let tmp: TableWithAlias[] = [];
  for (let o in ast) twa = [...twa, ...getTablesAndAliasesFromASTObject(ast[o])];
  for (let o of twa)
    if (o.table !== null && !tmp.find((objA) => objA.table === o.table && objA.as === o.as)) tmp.push(o);
  twa = [];
  for (let o of tmp) if (!tmp.find((objA) => objA.as === o.table)) twa.push(o);
  return twa;
};

export const getTableNamesAliasesAndColumnsFromQuery = async (query: string): Promise<[number, TACResponse]> => {
  // console.log('query: ', query);
  const ast = parser.astify(query, opt);
  // console.dir(ast, { depth: null });

  const tablesWithAliases = getTablesAndAliasesFromAST(ast);
  // console.log('table names: ', tablesWithAliases);
  // teraz by som mal odstranit aliasy a nasledne zistit nazvy stlpcov
  // treba nahradit vsetky aliasy okrem pripadu kedy FROM obsahuje subquery!
  let tac: TableWithAliasAndColumns[] = [];
  try {
    for (let obj of tablesWithAliases) {
      let [code, result] = await tableController.getTableColumns('cd', obj.table.toLocaleLowerCase());
      if (code !== 200) return [500, { message: 'Failed to obtain columns for table: ' + obj.table, tac: [] }];
      let tmptac = {
        table: obj.table,
        as: obj.as,
        columns: result.columns.map((column: { column_name: string }) => column.column_name),
      };
      tac.push(tmptac);
    }
  } catch (e) {
    return [500, { message: 'Failed', tac: [] }];
  }
  // console.dir(tac, {depth:null});
  return [200, { message: 'OK', tac }];
  // return names;
};

export const replaceTableAliasesWithTableName = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for (let t of tac) {
    let regex = new RegExp(`(${t.as}\\.)`, 'g');
    result = result.replace(regex, `${t.table}.`);
  }
  return result;
};

export const replaceAsterixWithTableAndColumns = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  let commaAsterixRegex = /,\*/g;
  let spaceAsterixRegex = / \*/g;
  let replacement = '';
  for (let t of tac) {
    for (let c of t.columns) replacement = replacement + t.table + '.' + c + ', ';
  }
  replacement = replacement.slice(0, -2);
  result = result.replace(commaAsterixRegex, ',' + replacement);
  result = result.replace(spaceAsterixRegex, ' ' + replacement);
  for(let t of tac) {
    replacement = '';
    let dotAsterixRegex = new RegExp(`${t.table}\\.\\*`, 'g');
    for(let c of t.columns) replacement = replacement + t.table + '.' + c + ', ';
    result = result.replace(dotAsterixRegex, replacement);
  }
  return result;
};

export const specifyColumnsWithoutTables = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for(let t of tac) {
    for(let c of t.columns) {
      let regex = new RegExp(`(?<!\\.)\\b${c}\\b`, 'gi');
      result = result.replace(regex, `${t.table}.${c.toUpperCase()}`);
    }
  }
  return result;
}

export const removeTableAliases = (query: string, tac: TableWithAliasAndColumns[]): string => {
  return '';
}

export const sortQueryAlphabetically = (query: string): string => {
  return '';
}
