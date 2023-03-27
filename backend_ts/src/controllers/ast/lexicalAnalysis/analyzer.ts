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

interface TableAliasAndColumns extends TableWithAlias {
    columns: string[];
}

function getTableNamesAndAliasesFromASTObject(obj: ASTObject): TableWithAlias[] {
  let results: TableWithAlias[] = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if ('table' in obj[key]) {
        results.push({
          table: obj[key].table,
          as: obj[key].as,
        });
      }
      results = [...results, ...getTableNamesAndAliasesFromASTObject(obj[key])];
    }
  }
  return results;
}

function getTableNamesAndAliasesFromAST(ast: ASTObject): TableWithAlias[] {
  let tac: TableWithAlias[] = [];
  let tmp: TableWithAlias[] = [];
  for (let o in ast) tmp = [...tmp, ...getTableNamesAndAliasesFromASTObject(ast[o])];
  for (let o of tmp) {
    if (!tac.find(objA => objA.table === o.table && objA.as === o.as)) tac.push(o);
  }
  return tac;
}

export const getTableNamesAliasesAndColumnsFromQuery = (query: string): TableWithAlias[] => {
  const ast = parser.astify(query, opt);
  const names = getTableNamesAndAliasesFromAST(ast);
    // teraz by som mal odstranit aliasy a nasledne zistit nazvy stlpcov
    // treba nahradit vsetky aliasy okrem pripadu kedy FROM obsahuje subquery!
  return names;
};
