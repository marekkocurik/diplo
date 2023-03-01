"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryResult = exports.getExercise = exports.getExerciseTree = void 0;
const exerciseController_1 = __importDefault(require("../../database/exerciseController"));
const exerciseController = new exerciseController_1.default();
const getExerciseTree = async (request, reply) => {
    let [code, response] = await exerciseController.getExerciseTree();
    reply.code(code).send(response);
    return;
};
exports.getExerciseTree = getExerciseTree;
const getExercise = async (request, reply) => {
    const { exercise_id } = request.query;
    let [code, response] = await exerciseController.getExercise(exercise_id);
    reply.code(code).send(response);
    return;
};
exports.getExercise = getExercise;
const getQueryResult = async (request, reply) => {
    const { role, queryToExecute } = request.query;
    let [code, response] = await exerciseController.getQueryResult(role, queryToExecute);
    reply.code(code).send(response);
    return;
};
exports.getQueryResult = getQueryResult;
// export const getExpectedResult = async (request:any, reply:any) => {
//   const { exercise_id } = request.query;
//   let [code, response] = await exerciseController.getExpectedResult(exercise_id);
//   reply.code(code).send(response);
//   return;
// }
