import TableController, { Solution } from '../../../databaseControllers/solutionsController';
import { sortASTAlphabetically } from './sorter';
import { GeneralResponse } from '../../../databaseControllers/databaseController';
import { AST, Parser } from 'node-sql-parser/build/postgresql';
import { createASTForQuery } from '../abstractSyntaxTree';
// import { Parser } from '../../../lib/node-sql-parser/types';

const parser = new Parser();
const opt = { database: 'PostgresQL' };
const tableController = new TableController();

export interface ASTObject {
  [key: string]: any;
}

interface TableWithAlias {
  table: string;
  as: string | null;
  column: string | null;
}

interface TableWithAliasAndColumns {
  table: string;
  as: string | null;
  columns: string[];
}

export const queryToUpperCase = (query: string): string => {
  let i = 0;
  let str = false;
  let newQuery = query;
  while (i < newQuery.length) {
    let j = i;
    while (j < newQuery.length) {
      if (newQuery.charAt(j) === "'") {
        str = !str;
        break;
      }
      j++;
    }

    if (str || j === newQuery.length) {
      let start = newQuery.substring(0, i);
      let change = newQuery.substring(i, j).toUpperCase();
      let end = j === newQuery.length ? '' : newQuery.substring(j);
      newQuery = start + change + end;
    }
    i = j + 1;
  }
  return newQuery;
};

const getTablesAndAliasesFromASTObject = (obj: ASTObject): TableWithAlias[] => {
  let results: TableWithAlias[] = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if ('table' in obj[key]) {
        results.push({
          table: obj[key].table,
          as: obj[key].as,
          column: obj[key].column,
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
    if (o.table !== null && !tmp.find((objA) => objA.table === o.table && objA.as === o.as && objA.column === o.column))
      tmp.push(o);
  twa = [];
  for (let o of tmp) if (!tmp.find((objA) => objA.as === o.table)) twa.push(o);
  return twa;
};

const getTableNamesAliasesAndColumnsFromQuery = async (
  query: string
): Promise<[GeneralResponse, TableWithAliasAndColumns[]]> => {
  let ast = parser.astify(query, opt);
  if (Array.isArray(ast)) ast = ast[0];
  // if ((ast[0].type as string).toLowerCase() === 'insert') return [{ code: 200, message: 'OK' }, []];
  if ((ast.type as string).toLowerCase() === 'insert') return [{ code: 200, message: 'OK' }, []];

  const tablesWithAliasesAndColumns = getTablesAndAliasesFromAST(ast);
  let tac: TableWithAliasAndColumns[] = [];
  try {
    for (let obj of tablesWithAliasesAndColumns) {
      let [response, result] = await tableController.getAllTableColumns('cd', obj.table.toLocaleLowerCase());
      if (response.code !== 200) return [{ code: response.code, message: response.message }, []];
      let tmptac = {
        table: obj.table,
        as: obj.as,
        columns: result.map((x) => x.column_name),
      };
      tac.push(tmptac);
    }
  } catch (error) {
    return [{ code: 500, message: 'Failed' }, []];
  }
  return [{ code: 200, message: 'OK' }, tac];
};

const replaceTableAliasesWithTableName = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for (let t of tac) {
    let regex = new RegExp(`(${t.as}\\.)`, 'g');
    result = result.replace(regex, `${t.table}.`);
  }
  return result;
};

const replaceAsterixWithTableAndColumns = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  let simpleAsterixRegex = new RegExp(`(?<=SELECT\\s)\\s*\\*\\s*(?=\\sFROM)`, 'g');
  let startingAsterixRegex = new RegExp(`(?<=SELECT\\s)\\s*\\*\\s*(?=,)`, 'g');
  let endingAsterixRegex = new RegExp(`(?<=,)\\s*\\*\\s*(?=\\sFROM)`, 'g');
  let betweenAsterixRegex = new RegExp(`(?<=,)\\s*\\*\\s*(?=,)`, 'g');

  let replacement = '';
  for (let t of tac) {
    for (let c of t.columns) replacement = replacement + t.table + '.' + c.toUpperCase() + ', ';
  }
  replacement = replacement.slice(0, -2);
  result = result.replace(simpleAsterixRegex, replacement);
  result = result.replace(startingAsterixRegex, replacement);
  result = result.replace(endingAsterixRegex, ' ' + replacement);
  result = result.replace(betweenAsterixRegex, ' ' + replacement);
  for (let t of tac) {
    replacement = '';
    let dotAsterixRegex = new RegExp(`${t.table}\\.\\*`, 'g');
    for (let c of t.columns) replacement = replacement + t.table + '.' + c.toUpperCase() + ', ';
    result = result.replace(dotAsterixRegex, replacement);
  }
  return result;
};

const specifyColumnsWithoutTables = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for (let t of tac) {
    for (let c of t.columns) {
      let regex = new RegExp(`(?<!\\.|AS\\s|as\\s)\\b${c}\\b`, 'gi');
      result = result.replace(regex, `${t.table}.${c.toUpperCase()}`);
    }
  }
  return result;
};

const removeTableAliases = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for (let t of tac) {
    let regex = new RegExp(`\\b(CD\\.${t.table})\\s+(as\\s+|AS\\s+)?(${t.as})\\b`, 'g');
    result = result.replace(regex, `CD.${t.table}`);
    regex = new RegExp(`\\b(${t.table})\\s+(as\\s+|AS\\s+)?(${t.as})\\b`, 'g');
    result = result.replace(regex, `${t.table}`);
  }
  return result;
};

const removeColumnAliases = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  let spaces = new RegExp(`\\s+`, 'g');
  for (let t of tac) {
    for (let c of t.columns) {
      let regex = new RegExp(
        `(?<=SELECT\\s+(.*)?${t.table}\\.${c}\\s+)(?:as\\s+|AS\\s+)?(\\w+)(?=\\s*(?:,|FROM))`,
        'gi'
      );
      let matches = result.matchAll(regex);
      result = result.replace(regex, ``);
      for (let match of matches) {
        let columnAlias = match[0].replace(spaces, ' ').trim();
        if (columnAlias.includes('as') || columnAlias.includes('AS')) columnAlias = columnAlias.split(' ')[1];
        let colRegexp = new RegExp(`[^\\.]\\b${columnAlias}\\b`, 'g');
        result = result.replace(colRegexp, ` ${t.table}.${c.toUpperCase()}`);
      }
    }
  }
  // let reg = new RegExp(`\\s+`, 'g');
  result = result.replace(spaces, ' ');
  let reg = new RegExp(`\\s,`, 'g');
  result = result.replace(reg, ',');
  return result.trim();
};

export const subQueryInObject = (obj: ASTObject): boolean => {
  return typeof obj === 'object' && obj !== null && 'ast' in obj;
};

const findSubQueryInArray = (arr: ASTObject[]): boolean => {
  for (let [key, val] of Object.entries(arr)) {
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val) && val.length > 0) {
        if (findSubQueryInArray(val)) return true;
      } else {
        if (subQueryInObject(val) || findSubQuery(val)) return true;
      }
    }
  }
  return false;
};

const findSubQuery = (obj: ASTObject): boolean => {
  for (let [key, val] of Object.entries(obj)) {
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val) && val.length > 0) {
        if (findSubQueryInArray(val)) return true;
      } else {
        if (subQueryInObject(val) || findSubQuery(val)) return true;
      }
    }
  }
  return false;
};

export const normalizeQuery = async (query: string): Promise<[GeneralResponse, string]> => {
  let newQuery = queryToUpperCase(query);
  const queryAstresponse = createASTForQuery(query);
  if (queryAstresponse[0].code !== 200) return [queryAstresponse[0], query];
  const ast = queryAstresponse[1] as AST;
  if (ast.type !== 'insert') {
    try {
      let [response, tablesAliasesAndColumns] = await getTableNamesAliasesAndColumnsFromQuery(newQuery);
      if (response.code !== 200) return [{ code: response.code, message: response.message }, ''];
      newQuery = replaceTableAliasesWithTableName(newQuery, tablesAliasesAndColumns);
      //TODO: odstranit useless aliasy (SELECT * FROM cd.facilities as F)
      // console.log(newQuery);
      newQuery = replaceAsterixWithTableAndColumns(newQuery, tablesAliasesAndColumns);
      newQuery = specifyColumnsWithoutTables(newQuery, tablesAliasesAndColumns);
      newQuery = removeTableAliases(newQuery, tablesAliasesAndColumns);
      newQuery = removeColumnAliases(newQuery, tablesAliasesAndColumns);
      // newQuery = sortQueryAlphabetically(newQuery);
      return [{ code: 200, message: 'OK' }, newQuery];
    } catch (error) {
      return [{ code: 500, message: 'Something went wrong while trying to normalize query' }, query];
    }
  } else {
    return [{ code: 200, message: 'OK' }, query];
  }
};
