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
  column: string | null;
}

interface TableWithAliasAndColumns {
  table: string;
  as: string | null;
  columns: string[];
}

export interface TACResponse {
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

export const updateSolutionToUpperCase = async (id: number, query: string): Promise<[number, Object]> => {
  try {
    query = queryToUpperCase(query);
    let [code, result] = await tableController.updateSolutionToUpperCase(id, query);
    return [code, result];
    // return [200, { message: 'ok' }];
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
          column: obj[key].column,
        });
      }
      results = [...results, ...getTablesAndAliasesFromASTObject(obj[key])];
    }
  }
  return results;
};

//const getTablesAndAliasesFromAST = (ast: ASTObject): TableWithAliasAndColumns[] => {
const getTablesAndAliasesFromAST = (ast: ASTObject): TableWithAlias[] => {
  // let tac: TableWithAliasAndColumns[] = [];
  let twa: TableWithAlias[] = [];
  let tmp: TableWithAlias[] = [];
  for (let o in ast) twa = [...twa, ...getTablesAndAliasesFromASTObject(ast[o])];
  // console.log('twa table names:');
  // console.dir(twa, { depth: null });
  for (let o of twa)
    if (o.table !== null && !tmp.find((objA) => objA.table === o.table && objA.as === o.as && objA.column === o.column))
      tmp.push(o);
  // console.log('tmp table names:');
  // console.dir(tmp, { depth: null });
  twa = [];
  for (let o of tmp) if (!tmp.find((objA) => objA.as === o.table)) twa.push(o);
  // for (let obj1 of tmp) {
  //   if (tmp.find((objA) => objA.as === obj1.table)) continue;
  //   let cols: string[] = [];
  //   if (!(obj1.as === undefined || obj1.as === null)) {
  //     for (let obj2 of tmp) {
  //       if (JSON.stringify(obj1) === JSON.stringify(obj2)) continue;
  //       else if (obj2.table === obj1.as && !(obj2.column === undefined || obj2.column === null)) {
  //         cols.push(obj2.column);
  //       }
  //     }
  //   }
  //   let x = {
  //     table: obj1.table,
  //     as: obj1.as,
  //     columns: cols,
  //   };
  //   tac.push(x);
  // }
  // return tac;
  return twa;
};

export const getTableNamesAliasesAndColumnsFromQuery = async (query: string): Promise<[number, TACResponse]> => {
  // console.log('query: ', query);
  const ast = parser.astify(query, opt);
  // console.dir(ast, { depth: null });

  const tablesWithAliasesAndColumns = getTablesAndAliasesFromAST(ast);
  // console.log('tac table names:');
  // console.dir(tablesWithAliasesAndColumns, { depth: null });
  // teraz by som mal odstranit aliasy a nasledne zistit nazvy stlpcov
  // treba nahradit vsetky aliasy okrem pripadu kedy FROM obsahuje subquery!
  let tac: TableWithAliasAndColumns[] = [];
  try {
    for (let obj of tablesWithAliasesAndColumns) {
      let [code, result] = await tableController.getTableColumns('cd', obj.table.toLocaleLowerCase());
      if (code !== 200) return [500, { message: 'Failed to obtain columns for table: ' + obj.table, tac: [] }];
      // let cols: string[] = result.columns.map((column: { column_name: string }) => column.column_name);
      // for (let c of obj.columns) if (!cols.find((name) => name.toLowerCase() === c.toLowerCase())) cols.push(c.toLowerCase());
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
  // console.log('final table names:');
  // console.dir(tac, { depth: null });
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
  // let commaAsterixRegex = /,\*/g;
  // let spaceAsterixRegex = / \*/g;

  let simpleAsterixRegex = new RegExp(`(?<=SELECT\\s)\\s*\\*\\s*(?=\\sFROM)`, 'g');
  let startingAsterixRegex= new RegExp(`(?<=SELECT\\s)\\s*\\*\\s*(?=,)`, 'g');
  let endingAsterixRegex= new RegExp(`(?<=,)\\s*\\*\\s*(?=\\sFROM)`, 'g');
  let betweenAsterixRegex= new RegExp(`(?<=,)\\s*\\*\\s*(?=,)`, 'g');
  /**
   * 1. * je sama -> SELECT * FROM
   * 2. * je na zaciatku -> SELECT *,
   * 3. * je na konci -> , * FROM
   * 4. * je uprostred -> , *,
   */
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

export const specifyColumnsWithoutTables = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for (let t of tac) {
    for (let c of t.columns) {
      let regex = new RegExp(`(?<!\\.|AS\\s|as\\s)\\b${c}\\b`, 'gi');
      // let regex = new RegExp(`(?<![${t.table}\\.${c}|AS\\s|as\\s|\\.])\\b${c}\\b`, 'gi');
      result = result.replace(regex, `${t.table}.${c.toUpperCase()}`);
    }
  }
  return result;
};

export const removeTableAliases = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  for (let t of tac) {
    let regex = new RegExp(`\\b(CD\\.${t.table})\\s+(as\\s+|AS\\s+)?(${t.as})\\b`, 'g');
    result = result.replace(regex, `CD.${t.table}`);
    regex = new RegExp(`\\b(${t.table})\\s+(as\\s+|AS\\s+)?(${t.as})\\b`, 'g');
    result = result.replace(regex, `${t.table}`);
  }
  return result;
};

const getColumnAliases = (query: string, tac: TableWithAliasAndColumns[]) => {};

export const replaceColumnAliases = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  //uloha 15 - ORDER BY MEMSNAME, MEMFNAME... treba pozriet aliasy columnov, vyhladat ich v query a nahradit za hodnotu columnu
  return result;
};

export const removeColumnAliases = (query: string, tac: TableWithAliasAndColumns[]): string => {
  let result = query;
  let spaces = new RegExp(`\\s+`, 'g');
  for (let t of tac) {
    for (let c of t.columns) {
      // console.log('matching: ' + t.table + '.' + c + ', alias: ' + t.as);
      let regex = new RegExp(
        `(?<=SELECT\\s+(.*)?${t.table}\\.${c}\\s+)(?:as\\s+|AS\\s+)?(\\w+)(?=\\s*(?:,|FROM))`,
        'gi'
      );
      //(?<=SELECT\s+)(\w+\.)*RECOMMENDERS\.MEMBER\s+(?:as\s+|AS\s+)?(\w+)(?=\s*(?:,|FROM))
      //(?<=SELECT\s+)(\w+\.)*RECOMMENDERS\.MEMBER\s+(?:as\s+|AS\s+)?(\w+)(?=\s*(?:,|FROM|\)))
      let matches = result.matchAll(regex);
      result = result.replace(regex, ``);
      for (let match of matches) {
        let columnAlias = match[0].replace(spaces, ' ').trim();
        if (columnAlias.includes('as') || columnAlias.includes('AS')) columnAlias = columnAlias.split(' ')[1];
        // console.log(columnAlias);
        let colRegexp = new RegExp(`[^\\.]\\b${columnAlias}\\b`, 'g')
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

export const sortQueryAlphabetically = (query: string): string => {
  return '';
};
