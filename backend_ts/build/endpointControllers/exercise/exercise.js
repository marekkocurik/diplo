"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuerySubmitResult = exports.getQueryTestResult = exports.getQueryExpectedResult = exports.getUserExerciseSolutions = exports.getExerciseHistory = exports.getExercise = exports.getExerciseTree = void 0;
const analyzer_1 = require("../ast/lexicalAnalysis/analyzer");
const exerciseFunctions_1 = require("./exerciseFunctions");
const getExerciseTree = async (request, reply) => {
    const user_id = request.query.id;
    let response;
    try {
        response = await exerciseFunctions_1.chaptersController.getAllChapters();
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const chapters = response[1];
        let exercise_ids = [];
        let i = 1;
        for (let chapter of chapters) {
            response = await exerciseFunctions_1.exercisesController.getTreeExercisesByChapterId(chapter.id);
            if (response[0].code !== 200) {
                reply.code(response[0].code).send({ message: response[0].message });
                return;
            }
            const exercises = response[1];
            let j = 1;
            for (let exercise of exercises) {
                exercise._id = j++;
                exercise_ids.push(exercise.id);
            }
            chapter._id = i++;
            chapter.exercises = exercises;
        }
        response = await exerciseFunctions_1.usersToExercisesController.getSolvedExercisesByUserId(user_id);
        if (response[0].code === 200) {
            let exercises_solved = response[1];
            for (let c of chapters) {
                c.solved = true;
                for (let e of c.exercises) {
                    let o = exercises_solved.find((item) => item.exercise_id === e.id);
                    e.solved = o === undefined ? false : true;
                    if (c.solved && !e.solved)
                        c.solved = false;
                }
            }
            response = await exerciseFunctions_1.usersToExercisesController.getStartedExercisesByUserId(user_id);
            if (response[0].code === 200) {
                let exercises_started = response[1];
                for (let c of chapters) {
                    for (let e of c.exercises) {
                        let o = exercises_started.find((item) => item.exercise_id === e.id);
                        e.started = o === undefined ? false : true;
                    }
                }
            }
        }
        reply.code(200).send({ message: 'OK', tree: chapters });
        return;
    }
    catch (error) {
        reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise tree' });
        return;
    }
};
exports.getExerciseTree = getExerciseTree;
const getExercise = async (request, reply) => {
    const { exerciseId } = request.query;
    let response;
    try {
        response = await exerciseFunctions_1.exercisesController.getExerciseById(exerciseId);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        let exercise = response[1];
        response = await exerciseFunctions_1.solutionsController.getExerciseExpectedSolutionOriginalQueryByExerciseId(exerciseId);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        let resp = Object.assign(Object.assign({}, exercise), { solution: response[1].original_query });
        reply.code(200).send({ message: 'OK', exercise: resp });
        return;
    }
    catch (error) {
        reply.code(500).send({ message: 'Unknown error occured while trying to receive exercise info' });
        return;
    }
};
exports.getExercise = getExercise;
const getExerciseHistory = async (request, reply) => {
    const { exerciseId } = request.query;
    const user_id = request.query.id;
    try {
        let response = await exerciseFunctions_1.answersController.getAllUserExerciseAnswersByExerciseIdAndUserId(exerciseId, user_id);
        reply.code(response[0].code).send({ message: response[0].message, answers: response[1] });
        return;
    }
    catch (error) {
        reply.code(500).send({
            message: "Unknown error occured while trying to obtain user's query history for Exercise: " + exerciseId,
        });
        return;
    }
};
exports.getExerciseHistory = getExerciseHistory;
const getUserExerciseSolutions = async (request, reply) => {
    const { exerciseId } = request.query;
    const user_id = request.query.id;
    try {
        let response = await exerciseFunctions_1.answersController.getAllUserExerciseSolutionAnswersByUserIdAndExerciseId(user_id, exerciseId);
        reply.code(response[0].code).send({ message: response[0].message, solutions: response[1] });
        return;
    }
    catch (error) {
        reply.code(500).send({
            message: "Unknown error occured while trying to obtain user's solution Answers for Exercise id: " + exerciseId,
        });
        return;
    }
};
exports.getUserExerciseSolutions = getUserExerciseSolutions;
const getQueryExpectedResult = async (request, reply) => {
    const { role, queryToExecute } = request.query;
    let response = await (0, exerciseFunctions_1.executeQuery)(role, queryToExecute, 'get', 'expected');
    reply.code(response[0].code).send({ message: response[0].message, queryResultInfo: response[1] });
    return;
};
exports.getQueryExpectedResult = getQueryExpectedResult;
const getQueryTestResult = async (request, reply) => {
    const { role, exerciseId, queryToExecute, solution } = request.query;
    const user_id = request.query.id;
    let response;
    response = await (0, exerciseFunctions_1.testQueries)(role, solution, queryToExecute, 'test');
    // 200 - OK
    // 400 - ERROR query
    // 403 - BAD REQUEST (prazdne query)
    // 500 - chyba s pripojenim na DB
    if (response[0].code === 403 || response[0].code === 500) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    const queryTestResult = response;
    let solutionSuccess = response[0].code === 400 ? 'ERROR' : response[1].queriesResultsMatch ? 'PARTIAL' : 'WRONG';
    response = await (0, exerciseFunctions_1.processNewAnswerReturningId)(user_id, exerciseId, queryToExecute, solutionSuccess, false, queryTestResult[1].executionTime);
    if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    let queryResultInfo = {
        id: response[1],
        queryResult: queryTestResult[1].queryResult,
        solutionSuccess,
    };
    reply.code(queryTestResult[0].code).send({ message: queryTestResult[0].message, queryResultInfo });
    return;
};
exports.getQueryTestResult = getQueryTestResult;
const getQuerySubmitResult = async (request, reply) => {
    const { role, exerciseId, solution } = request.query;
    let { queryToExecute } = request.query;
    const user_id = request.query.id;
    const uppercaseQuery = (0, analyzer_1.queryToUpperCase)(queryToExecute);
    let response;
    response = await (0, exerciseFunctions_1.testQueries)(role, solution, queryToExecute, 'test');
    if (response[0].code === 403 || response[0].code === 500) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    const queryTestResultPrimaryDatabase = response;
    let solutionSuccess = response[0].code === 400 ? 'ERROR' : response[1].queriesResultsMatch ? 'PARTIAL' : 'WRONG';
    if (queryTestResultPrimaryDatabase[0].code === 200 && solutionSuccess === 'PARTIAL') {
        const editedSolutionQuery = (0, exerciseFunctions_1.editQueryToSecondScheme)(solution);
        const editedStudentQuery = (0, exerciseFunctions_1.editQueryToSecondScheme)(uppercaseQuery);
        response = await (0, exerciseFunctions_1.testQueries)(role, editedSolutionQuery, editedStudentQuery, 'submit');
        if (response[0].code === 500) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        else if (response[0].code === 200) {
            const res = response[0];
            let queryResultInfo = {
                solutionSuccess: 'COMPLETE',
                queryResult: response[1].queryResult,
            };
            response = await (0, exerciseFunctions_1.processNewAnswerReturningId)(user_id, exerciseId, queryToExecute, 'COMPLETE', true, queryTestResultPrimaryDatabase[1].executionTime);
            if (response[0].code !== 200) {
                reply.code(response[0].code).send({ message: response[0].message });
                return;
            }
            response = await (0, exerciseFunctions_1.updateUsersToExerciseToSolved)(user_id, exerciseId);
            if (response.code !== 200) {
                reply.code(response.code).send({ message: response.message });
                return;
            }
            response = await (0, exerciseFunctions_1.proccessNewSolution)(exerciseId, queryToExecute);
            if (response.code !== 200) {
                // TODO: user case: solution je spravne, ale nejde ulozit - co s tym chcem spravit? Mozem vytvorit nejaky proces, ktory raz za cas prebehne answers a porovna, ci vsetky success = 'COMPLETE' su aj v users.solutions
                let res = {
                    message: 'Solution is correct, but it could not be saved.',
                };
            }
            reply.code(res.code).send({ message: res.message, queryResultInfo });
            return;
        }
        else
            solutionSuccess = 'ERROR';
    }
    //200-WRONG / 400-ERROR
    response = await (0, exerciseFunctions_1.processNewAnswerReturningId)(user_id, exerciseId, queryToExecute, solutionSuccess, true, queryTestResultPrimaryDatabase[1].executionTime);
    if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    const answer_id = response[1];
    let queryResultInfo = {
        id: answer_id,
        solutionSuccess,
        queryResult: queryTestResultPrimaryDatabase[0].code === 400 ? undefined : queryTestResultPrimaryDatabase[1].queryResult,
    };
    reply
        .code(queryTestResultPrimaryDatabase[0].code)
        .send({ message: queryTestResultPrimaryDatabase[0].message, queryResultInfo });
    return;
};
exports.getQuerySubmitResult = getQuerySubmitResult;
