"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDatabase = void 0;
const maintenanceController_1 = __importDefault(require("../../databaseControllers/maintenanceController"));
const analyzer_1 = require("../ast/lexicalAnalysis/analyzer");
const { Parser } = require('node-sql-parser/build/postgresql');
const parser = new Parser();
const opt = { database: 'PostgresQL' };
const mController = new maintenanceController_1.default();
const getAllSolutionsOriginalQuery = async () => {
    try {
        const [response, result] = await mController.getAllSolutionsOriginalQuery();
        return [response, result];
    }
    catch (error) {
        return [
            { code: 500, message: "ADMIN: Unknown error occured while trying to get all Solutions' original_query" },
            [],
        ];
    }
};
const updateSolutionToUpperCase = async (solution_id, original_query) => {
    try {
        let updatedQuery = (0, analyzer_1.queryToUpperCase)(original_query);
        const response = await mController.updateSolutionOriginalQueryToUpperCaseById(solution_id, updatedQuery);
        return [response, updatedQuery];
    }
    catch (error) {
        return [
            {
                code: 500,
                message: 'ADMIN: Unknown error occured while trying to update original_query to uppercase for Solution id: ' +
                    solution_id,
            },
            original_query,
        ];
    }
};
const updateSolutionNormalizedQuery = async (solution_id, normalized_query) => {
    try {
        const response = await mController.updateSolutionNormalizedQueryById(solution_id, normalized_query);
        return response;
    }
    catch (error) {
        return {
            code: 500,
            message: 'ADMIN: Unknown error occured while trying to update normalized_query for Solution id: ' + solution_id,
        };
    }
};
const updateSolutionAST = async (solution_id, normalized_query) => {
    try {
        let ast = parser.astify(normalized_query, opt);
        if (Array.isArray(ast))
            ast = ast[0];
        // sortASTAlphabetically(ast);
        const response = await mController.updateSolutionASTById(solution_id, JSON.stringify(ast));
        return response;
    }
    catch (error) {
        return {
            code: 500,
            message: 'ADMIN: Unknown error occured while trying to update AST for Solution id: ' + solution_id,
        };
    }
};
const updateDatabase = async (request, reply) => {
    let response;
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
        response = await (0, analyzer_1.normalizeQuery)(updatedSolution);
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
exports.updateDatabase = updateDatabase;
