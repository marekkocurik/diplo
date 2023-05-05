"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proccessNewSolution = exports.editSolutionBeforeSaving = exports.checkIfSolutionExist = exports.editQueryToSecondScheme = exports.insertNewSolution = exports.processNewAnswerReturningId = exports.insertNewAnswerReturningId = exports.insertNewUsersToExercisesReturningId = exports.getUsersToExercisesId = exports.updateUsersToExerciseToSolved = exports.testQueries = exports.executeQuery = exports.queryResultsMatch = exports.usersToExercisesController = exports.chaptersController = exports.answersController = exports.solutionsController = exports.exercisesController = void 0;
const exercisesController_1 = __importDefault(require("../../databaseControllers/exercisesController"));
const analyzer_1 = require("../ast/lexicalAnalysis/analyzer");
const solutionsController_1 = __importDefault(require("../../databaseControllers/solutionsController"));
const answersController_1 = __importDefault(require("../../databaseControllers/answersController"));
const chaptersController_1 = __importDefault(require("../../databaseControllers/chaptersController"));
const usersToExercisesController_1 = __importDefault(require("../../databaseControllers/usersToExercisesController"));
const abstractSyntaxTree_1 = require("../ast/abstractSyntaxTree");
exports.exercisesController = new exercisesController_1.default();
exports.solutionsController = new solutionsController_1.default();
exports.answersController = new answersController_1.default();
exports.chaptersController = new chaptersController_1.default();
exports.usersToExercisesController = new usersToExercisesController_1.default();
const queryResultsMatch = (solution_query_result, student_query_result) => {
    if (JSON.stringify(solution_query_result) === JSON.stringify(student_query_result))
        return true;
    return false;
};
exports.queryResultsMatch = queryResultsMatch;
const executeQuery = async (role, query, action, queryType) => {
    try {
        let response = await exports.exercisesController.getQueryResult(role, query);
        return [response[0], response[1]];
    }
    catch (error) {
        let response = { code: 0, message: '' };
        if (error instanceof Error) {
            response.code = 400;
            response.message = error.message;
            return [response, { queryResult: {}, executionTime: 0 }];
        }
        else {
            response.code = 500;
            response.message = 'Unknown error occured while trying to ' + action + ' ' + queryType + ' query';
            return [response, { queryResult: {}, executionTime: 0 }];
        }
    }
};
exports.executeQuery = executeQuery;
const testQueries = async (role, solutionQuery, studentQuery, action) => {
    let testResponse = {
        queriesResultsMatch: false,
    };
    let response = await (0, exports.executeQuery)(role, solutionQuery, action, 'solution');
    if (response[0].code !== 200)
        return [response[0], Object.assign(testResponse, response[1])];
    let solutionResult = response[1].queryResult;
    response = await (0, exports.executeQuery)(role, studentQuery, action, 'user');
    if (response[0].code !== 200)
        return [response[0], Object.assign(testResponse, response[1])];
    let studentResult = response[1].queryResult;
    testResponse.queriesResultsMatch = (0, exports.queryResultsMatch)(solutionResult, studentResult);
    return [{ code: 200, message: 'OK' }, Object.assign(testResponse, response[1])];
};
exports.testQueries = testQueries;
const updateUsersToExerciseToSolved = async (user_id, exercise_id) => {
    try {
        let response = await exports.usersToExercisesController.updateToSolved(user_id, exercise_id);
        return response;
    }
    catch (error) {
        return {
            code: 500,
            message: 'Unknown error occured while trying to update users_to_exercise to solved for user_id ' +
                user_id +
                ', exercise_id ' +
                exercise_id,
        };
    }
};
exports.updateUsersToExerciseToSolved = updateUsersToExerciseToSolved;
const getUsersToExercisesId = async (user_id, exercise_id) => {
    try {
        let response = await exports.usersToExercisesController.getIdByUserIdAndExerciseId(user_id, exercise_id);
        return [response[0], response[1]];
    }
    catch (error) {
        return [
            {
                code: 500,
                message: 'Unknown error occured while trying to get users_to_exercises info: user_id ' +
                    user_id +
                    ', exercise_id ' +
                    exercise_id,
            },
            undefined,
        ];
    }
};
exports.getUsersToExercisesId = getUsersToExercisesId;
const insertNewUsersToExercisesReturningId = async (user_id, exercise_id) => {
    try {
        let response = await exports.usersToExercisesController.insertReturningId(user_id, exercise_id);
        return [response[0], response[1]];
    }
    catch (error) {
        return [
            {
                code: 500,
                message: 'Unknown error occured while trying to insert new users_to_exercises for user_id: ' +
                    user_id +
                    ', exercise_id: ' +
                    exercise_id,
            },
            -1,
        ];
    }
};
exports.insertNewUsersToExercisesReturningId = insertNewUsersToExercisesReturningId;
const insertNewAnswerReturningId = async (users_to_exercises_id, query, solution_success, submit_attempt, execution_time) => {
    try {
        let response = await exports.answersController.insertReturningId(users_to_exercises_id, query, solution_success, submit_attempt, execution_time);
        return response;
    }
    catch (error) {
        return [{ code: 500, message: "Unknow error occured while trying to insert user's answer" }, -1];
    }
};
exports.insertNewAnswerReturningId = insertNewAnswerReturningId;
const processNewAnswerReturningId = async (user_id, exercise_id, query, solution_success, submit_attempt, execution_time) => {
    let response;
    response = await (0, exports.getUsersToExercisesId)(user_id, exercise_id);
    if (response[0].code !== 200)
        return [response[0], -1];
    if (response[1] === undefined) {
        response = await (0, exports.insertNewUsersToExercisesReturningId)(user_id, exercise_id);
        if (response[0].code !== 200)
            return response;
    }
    const ute_id = response[1];
    response = await (0, exports.insertNewAnswerReturningId)(ute_id, query, solution_success, submit_attempt, execution_time);
    return response;
};
exports.processNewAnswerReturningId = processNewAnswerReturningId;
const insertNewSolution = async (exerciseID, original_query, normalized_query, ast) => {
    try {
        let response = await exports.solutionsController.insert(exerciseID, original_query, normalized_query, ast);
        return response;
    }
    catch (error) {
        return { code: 500, message: 'Unknown error occured while trying to insert new solution' };
    }
};
exports.insertNewSolution = insertNewSolution;
const editQueryToSecondScheme = (query) => {
    const regex = /\sCD\./gi;
    const replacement = ' CD2.';
    const newQuery = query.replace(regex, replacement);
    return newQuery;
};
exports.editQueryToSecondScheme = editQueryToSecondScheme;
const checkIfSolutionExist = async (exerciseID, normalizedPotentialSolution) => {
    try {
        let response = await exports.solutionsController.getAllExerciseSolutionsNormalizedQueryByExerciseId(exerciseID);
        if (response[0].code !== 200)
            return response[0];
        // console.log('new pot sol: ', normalizedPotentialSolution)
        for (let solution of response[1]) {
            // console.log('already known sol: ', solution.normalized_query);
            if (normalizedPotentialSolution === solution.normalized_query) {
                // console.log('solution already exists: ', solution.normalized_query);
                return { code: 200, message: 'Solution already exists' };
            }
        }
        // console.log('solution does not exist yet');
        return { code: 200, message: 'Solution does not exist yet' };
    }
    catch (error) {
        return {
            code: 500,
            message: 'Unknown error occured while trying to get all Solutions normalized_query for Exercise id: ' + exerciseID,
        };
    }
};
exports.checkIfSolutionExist = checkIfSolutionExist;
const editSolutionBeforeSaving = (solution) => {
    if (solution.charAt(solution.length - 1) !== ';')
        solution += ';';
    return solution;
};
exports.editSolutionBeforeSaving = editSolutionBeforeSaving;
const proccessNewSolution = async (exercise_id, potentialSolution) => {
    potentialSolution = (0, exports.editSolutionBeforeSaving)(potentialSolution);
    let response;
    response = await (0, analyzer_1.normalizeQuery)(potentialSolution);
    if (response[0].code !== 200)
        return response[0];
    const normalizedPotentialSolution = response[1];
    response = (0, abstractSyntaxTree_1.createASTForQuery)(response[1]);
    if (response[0].code !== 200)
        return response[0];
    const ast = response[1];
    response = await (0, exports.checkIfSolutionExist)(exercise_id, normalizedPotentialSolution);
    if (response.code === 200 && response.message === 'Solution does not exist yet') {
        response = await (0, exports.insertNewSolution)(exercise_id, potentialSolution, normalizedPotentialSolution, JSON.stringify(ast));
    }
    return response;
};
exports.proccessNewSolution = proccessNewSolution;
