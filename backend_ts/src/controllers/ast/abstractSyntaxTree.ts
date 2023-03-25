// import { parse } from 'node-sql-parser';

// function replaceAliasesWithOriginal(query: string): string {
//   const ast = parse(query);
//   traverseAST(ast, replaceAliasNode);
//   return stringifyAST(ast);
// }

// function traverseAST(node: any, callback: Function) {
//   if (!node) {
//     return;
//   }
//   callback(node);
//   for (const key in node) {
//     if (node.hasOwnProperty(key)) {
//       const child = node[key];
//       if (Array.isArray(child)) {
//         child.forEach((grandchild) => traverseAST(grandchild, callback));
//       } else if (typeof child === 'object') {
//         traverseAST(child, callback);
//       }
//     }
//   }
// }

// function replaceAliasNode(node: any) {
//   if (node.type === 'table_alias') {
//     const { table, name } = node;
//     delete node.name;
//     node.table = replaceAliasesInTableName(table, name);
//   } else if (node.type === 'column_ref') {
//     const { table, column } = node;
//     if (table) {
//       node.table = replaceAliasesInTableName(table, node.table_alias);
//     }
//   }
// }

// function replaceAliasesInTableName(table: any, alias: string) {
//   if (!alias) {
//     return table;
//   }
//   const parts = table.split('.');
//   const tableName = parts[parts.length - 1];
//   const newTableName = aliasToOriginal[alias] || tableName;
//   if (newTableName !== tableName) {
//     parts[parts.length - 1] = newTableName;
//     return parts.join('.');
//   } else {
//     return table;
//   }
// }

// function stringifyAST(ast: any): string {
//   return ast.toString().replace(/"/g, '`');
// }

// // Map of aliases to their original table names
// const aliasToOriginal = {
//   a: 'table',
//   b: 'other_table',
// };

// const query = `
//   SELECT a.column1, b.column2
//   FROM table as a
//   JOIN other_table b ON a.id = b.a_id
//   WHERE a.column1 = 'foo' AND b.column2 > 42
// `;

// const replacedQuery = replaceAliasesWithOriginal(query);
// console.log(replacedQuery);





/*

SELECT *
FROM cd.members m
JOIN cd.bookings b ON b.memid = m.memid
WHERE m.joindate = (
  SELECT * FROM cd.facilities f
  WHERE id IN (
    SELECT * FROM cd.members me
  )
)

*/