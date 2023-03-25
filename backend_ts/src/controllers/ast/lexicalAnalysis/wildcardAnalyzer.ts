// import * as pgQueryParser from 'pg-query-parser';
import TableController from '../../../database/tableController';
const { Parser } = require('node-sql-parser/build/postgresql');

interface GeneralResponse {
  message: string;
}

interface TablesAndColumns extends GeneralResponse {
  tablesAndColumns: {
    table: string;
    alias: string | null;
    columns: string[];
  }[];
}

const parser = new Parser();
const opt = { database: 'PostgresQL' };
const tableController = new TableController();

function replaceAsteriskWithColumns(sql: string, tac: TablesAndColumns): string {
    // parse the SQL query
    const ast = parser.astify(sql, opt);
    console.dir(ast,{depth:null});
    console.log(ast.value);
  
    // loop through all the select expressions
    ast.value.selectItems.forEach((selectItem: any) => {
      // check if the select item is an asterisk
      if (selectItem.type === 'Wildcard') {
        // loop through all the tables in the tac object
        tac.tablesAndColumns.forEach((table: {table: string, columns: string[]}) => {
          // find the table in the from clause
          const tableRef = ast.value.from.find((fromItem: any) => {
            return fromItem.table === table.table;
          });
  
          // add the columns to the select expression
          table.columns.forEach((column: string) => {
            const newSelectItem = {
              type: 'ColumnRef',
              column: { type: 'Identifier', value: column },
              table: { type: 'Identifier', value: tableRef.as || tableRef.table }
            };
            ast.value.selectItems.splice(ast.value.selectItems.indexOf(selectItem), 1, newSelectItem);
          });
        });
      }
    });
  
    // generate the modified SQL query
    const newSql = parser.sqlify(ast, opt);
  
    return newSql;
  }

const getTablesAndColumnNames = async (ast: any): Promise<[number, TablesAndColumns]> => {
  try {
    let tac: { table: string; alias: string | null; columns: string[] }[] = [];
    for (let o of ast.from) {
      let [code, response] = await tableController.getTableColumns(o.db, o.table);
      if (code !== 200) return [code, { message: response.message, tablesAndColumns: [] }];
      tac.push({
        table: o.table,
        alias: o.as,
        columns: response.columns.map((column: { column_name: string }) => column.column_name),
      });
    }
    let response = {
      message: 'OK',
      tablesAndColumns: tac,
    };
    return [200, response];
  } catch (e) {
    return [500, { message: 'Unknown error occured while trying to obtain tables with their columns names', tablesAndColumns: [] }];
  }
};

export const getTableColumns = async (request: any, reply: any) => {
  let { query } = request.query;
  if (query[query.length - 1] === ';') query = query.slice(0, -1);
  console.log('new call')
  try {
    const ast = parser.astify(query, opt);
    
    let [code, tablesAndColumns] = await getTablesAndColumnNames(ast);
    if (code !== 200) {
      reply.code(200).send(tablesAndColumns.message);
      return;
    }
    // console.dir(tablesAndColumns, { depth: null });
    const newQuery = replaceAsteriskWithColumns(query, tablesAndColumns);
    console.log(newQuery);
    reply.code(200).send({ message: 'OK' });
    return;
  } catch (e) {
    reply.code(500).send({ message: 'Unknown error occured while trying to obtain table columns' });
    return;
  }
};
