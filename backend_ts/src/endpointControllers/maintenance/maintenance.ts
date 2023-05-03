import { GeneralResponse } from '../../databaseControllers/databaseController';
import MaintenanceController from '../../databaseControllers/maintenanceController';
import { Solution_ID_OriginalQuery } from '../../databaseControllers/solutionsController';
import { normalizeQuery, queryToUpperCase } from '../ast/lexicalAnalysis/analyzer';
import { sortASTAlphabetically } from '../ast/lexicalAnalysis/sorter';
const { Parser } = require('node-sql-parser/build/postgresql');

const parser = new Parser();
const opt = { database: 'PostgresQL' };
const mController = new MaintenanceController();

type responseObject = GeneralResponse | [GeneralResponse, Solution_ID_OriginalQuery[]] | [GeneralResponse, string];

const getAllSolutionsOriginalQuery = async (): Promise<[GeneralResponse, Solution_ID_OriginalQuery[]]> => {
  try {
    const [response, result] = await mController.getAllSolutionsOriginalQuery();
    return [response, result];
  } catch (error) {
    return [
      { code: 500, message: "ADMIN: Unknown error occured while trying to get all Solutions' original_query" },
      [],
    ];
  }
};

const updateSolutionToUpperCase = async (
  solution_id: number,
  original_query: string
): Promise<[GeneralResponse, string]> => {
  try {
    let updatedQuery = queryToUpperCase(original_query);
    const response = await mController.updateSolutionOriginalQueryToUpperCaseById(solution_id, updatedQuery);
    return [response, updatedQuery];
  } catch (error) {
    return [
      {
        code: 500,
        message:
          'ADMIN: Unknown error occured while trying to update original_query to uppercase for Solution id: ' +
          solution_id,
      },
      original_query,
    ];
  }
};

const updateSolutionNormalizedQuery = async (
  solution_id: number,
  normalized_query: string
): Promise<GeneralResponse> => {
  try {
    const response = await mController.updateSolutionNormalizedQueryById(solution_id, normalized_query);
    return response;
  } catch (error) {
    return {
      code: 500,
      message: 'ADMIN: Unknown error occured while trying to update normalized_query for Solution id: ' + solution_id,
    };
  }
};

const updateSolutionAST = async (solution_id: number, normalized_query: string): Promise<GeneralResponse> => {
  try {
    let ast = parser.astify(normalized_query, opt);
    if (Array.isArray(ast)) ast = ast[0];
    // sortASTAlphabetically(ast);
    const response = await mController.updateSolutionASTById(solution_id, JSON.stringify(ast));
    return response;
  } catch (error) {
    return {
      code: 500,
      message: 'ADMIN: Unknown error occured while trying to update AST for Solution id: ' + solution_id,
    };
  }
};

export const updateDatabase = async (request: any, reply: any) => {
  let response: responseObject;
  response = await getAllSolutionsOriginalQuery();
  if (response[0].code !== 200) {
    reply.code(response[0].code).send({ message: response[0].message });
    return;
  }
  const originalSolutions = response[1];
  for (let s of originalSolutions) {
    response = await updateSolutionToUpperCase(s.id, s.original_query);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const updatedSolution = response[1];
    response = await normalizeQuery(updatedSolution);
    if (response[0].code !== 200) {
      reply.code(response[0].code).send({ message: response[0].message });
      return;
    }
    const normalizedQuery = response[1];
    response = await updateSolutionNormalizedQuery(s.id, normalizedQuery);
    if (response.code !== 200) {
      reply.code(response.code).send({ message: response.message });
      return;
    }
    response = await updateSolutionAST(s.id, normalizedQuery);
    if (response.code !== 200) {
      reply.code(response.code).send({ message: response.message });
      return;
    }
  }
  reply.code(200).send({ message: 'Database updated successfully' });
  return;
};
