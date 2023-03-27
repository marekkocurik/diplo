import { getTableNamesAliasesAndColumnsFromQuery } from "./lexicalAnalysis/analyzer";

export const getAST = async (request: any, reply: any) => {
  let { query } = request.query;
  if (query[query.length - 1] === ';') query = query.slice(0, -1);
  console.log(getTableNamesAliasesAndColumnsFromQuery(query));

  // const finalAst = {}
  // const response = {
  //   message: 'OK',
  //   ast: finalAst
  // }
  // return [200, response]
  reply.code(200).send({message:'ok'});
  return;
};
