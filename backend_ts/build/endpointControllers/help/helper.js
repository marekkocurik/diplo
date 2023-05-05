"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelp = void 0;
const exerciseFunctions_1 = require("../exercise/exerciseFunctions");
const analyzer_1 = require("../ast/lexicalAnalysis/analyzer");
const abstractSyntaxTree_1 = require("../ast/abstractSyntaxTree");
const comparator_1 = require("../ast/lexicalAnalysis/comparator");
const recommendator_1 = require("../recommendations/recommendator");
const normalizeStudentQueryAndCreateAST = async (role, query) => {
    let sol = {
        original_query: query,
        normalized_query: '',
        ast: { type: 'use', db: '' },
    };
    let response;
    response = await (0, exerciseFunctions_1.executeQuery)(role, query, 'get', 'help');
    if (response[0].code !== 200)
        return [response[0], sol];
    response = await (0, analyzer_1.normalizeQuery)(query);
    if (response[0].code !== 200)
        return [response[0], sol];
    sol.normalized_query = response[1];
    response = await (0, abstractSyntaxTree_1.createASTForQuery)(sol.normalized_query);
    if (response[0].code !== 200)
        return [response[0], sol];
    sol.ast = response[1];
    return [response[0], sol];
};
const getExerciseSolutions = async (exercise_id) => {
    try {
        let [code, result] = await exerciseFunctions_1.solutionsController.getAllExerciseSolutionsByExerciseId(exercise_id);
        return [code, result];
    }
    catch (error) {
        return [
            { code: 500, message: 'Something went wrong while trying to receive solutions for exercise id: ' + exercise_id },
            [],
        ];
    }
};
const hasSubAst = (value) => {
    return typeof value === 'object' && 'ast' in value;
};
const findSubAST = (obj) => {
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'object' && obj[i] !== null) {
                if (hasSubAst(obj[i]) || findSubAST(obj[i]))
                    return true;
            }
        }
        return false;
    }
    else {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (hasSubAst(obj[key]) || findSubAST(obj[key]))
                    return true;
            }
        }
        return false;
    }
};
// const findSubAST = (obj: ASTObject): boolean => {
//     console.log('Starting the search for obj:');
//     console.log(obj);
//   if (Array.isArray(obj)) {
//     console.log('Obj is ARRAY');
//     for (let i = 0; i < obj.length; i++) {
//       if (typeof obj[i] === 'object' && obj[i] !== null) {
//         // if (isSubAst(obj[i]) || findSubAST(obj[i])) return true;
//         if (isSubAst(obj[i])) {
//             console.log('FOUND SUB AST AND RETURNING TRUE');
//             return true;
//         }
//         console.log('GOING DEEPER');
//         if(findSubAST(obj[i])) {
//             console.log('RETURNING TRUE');
//             return true;
//         }
//       }
//     }
//     console.log('RETURNING FALSE');
//     return false;
//   } else {
//     console.log('Obj is NOT ARRAY');
//     for (let key in obj) {
//       if (typeof obj[key] === 'object' && obj[key] !== null) {
//         // if (isSubAst(obj[key]) || findSubAST(obj[key])) return true;
//         if (isSubAst(obj[key])) {
//             console.log('FOUND SUB AST AND RETURNING TRUE');
//             return true;
//         }
//         console.log('GOING DEEPER');
//         if(findSubAST(obj[key])) {
//             console.log('RETURNING TRUE');
//             return true;
//         }
//       }
//     }
//     console.log('RETURNING FALSE');
//     return false;
//   }
// };
const selectHasSubquery = (ast) => {
    if (ast.columns !== null && ast.columns !== '*' && findSubAST(ast.columns))
        return 'select';
    else if (ast.from !== null && findSubAST(ast.from))
        return 'from';
    else if (ast.where !== null && findSubAST(ast.where))
        return 'where';
    else if (ast.having !== null && findSubAST(ast.having))
        return 'having';
    else
        return '';
};
const prioritizeSolutions = (studentSolution, exerciseSolutions) => {
    let solsWithSubQueryInSameBranch = [];
    let solsWithSubQuery = [];
    let solsWithoutSubQuery = [];
    let prioritized = [];
    if (studentSolution.ast.type === 'select') {
        const branch = selectHasSubquery(studentSolution.ast);
        if (branch !== '') {
            for (let s of exerciseSolutions) {
                let sBranch = selectHasSubquery(JSON.parse(s.ast));
                if (sBranch === branch)
                    solsWithSubQueryInSameBranch.push(s);
                else if (sBranch !== '')
                    solsWithSubQuery.push(s);
                else
                    solsWithoutSubQuery.push(s);
            }
            prioritized.push(...solsWithSubQueryInSameBranch, ...solsWithSubQuery, ...solsWithoutSubQuery);
        }
        else {
            for (let s of exerciseSolutions) {
                let sBranch = selectHasSubquery(JSON.parse(s.ast));
                if (sBranch === '')
                    solsWithoutSubQuery.push(s);
                else
                    solsWithSubQuery.push(s);
            }
            prioritized.push(...solsWithoutSubQuery, ...solsWithSubQuery);
        }
    }
    else {
        if (findSubAST(studentSolution.ast)) {
            for (let s of exerciseSolutions) {
                if (findSubAST(JSON.parse(s.ast)))
                    solsWithSubQuery.push(s);
                else
                    solsWithoutSubQuery.push(s);
            }
            prioritized.push(...solsWithSubQuery, ...solsWithoutSubQuery);
        }
        else {
            for (let s of exerciseSolutions) {
                if (!findSubAST(JSON.parse(s.ast)))
                    solsWithoutSubQuery.push(s);
                else
                    solsWithSubQuery.push(s);
            }
            prioritized.push(...solsWithoutSubQuery, ...solsWithSubQuery);
        }
    }
    return prioritized;
};
const getHelp = async (request, reply) => {
    const { role, cluster, exerciseId, queryToExecute } = request.query;
    // const user_id = request.query.id;
    let response;
    response = await normalizeStudentQueryAndCreateAST(role, queryToExecute);
    if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    const solAttempt = response[1];
    response = await getExerciseSolutions(exerciseId);
    if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    const exerciseSolutions = response[1];
    let prioritizedExerciseSolutions = prioritizeSolutions(solAttempt, exerciseSolutions);
    // console.log('Selected solution AST:');
    // console.dir(JSON.parse(prioritizedExerciseSolutions[0].ast), {depth:null});
    console.log('User query AST:');
    const x = (0, abstractSyntaxTree_1.createASTForQuery)(queryToExecute);
    console.dir(x, { depth: null });
    console.log('User query AST normalized:');
    const xx = (await normalizeStudentQueryAndCreateAST(role, queryToExecute))[1].ast;
    console.dir(xx, { depth: null });
    // porovnanie studentovho AST s prvym AST z prioritizovanych solutions
    response = (0, comparator_1.compareQueryASTS)(solAttempt.ast, JSON.parse(prioritizedExerciseSolutions[0].ast));
    if (response[0].code !== 200) {
        reply.code(response[0].code).send({ message: response[0].message });
        return;
    }
    const missing = response[1];
    const extras = response[2];
    const recs = (0, recommendator_1.createRecommendations)(JSON.parse(prioritizedExerciseSolutions[0].ast).type, missing, extras, cluster);
    reply.code(200).send({ message: 'OK', solAttempt });
    return;
};
exports.getHelp = getHelp;
