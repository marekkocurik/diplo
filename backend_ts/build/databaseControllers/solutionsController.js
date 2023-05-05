"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class SolutionController extends databaseController_1.default {
    async getAllExerciseSolutionsByExerciseId(exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT S.id, S.original_query, S.normalized_query, S.abstract_syntax_tree as ast ' +
                'FROM users.solutions as S WHERE S.exercise_id = $1 ORDER BY S.id';
            let result = await client.query(query, [exercise_id]);
            if (result.rows[0] === undefined)
                return [{ code: 500, message: 'Failed to obtain solutions for exercise_id: ' + exercise_id }, []];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getAllOriginalSolutionsOriginalQuery() {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT S.id, S.original_query FROM users.solutions as S WHERE S.id <= 69 ORDER BY S.id';
            let result = await client.query(query);
            if (result.rows[0] === undefined)
                return [{ code: 500, message: 'Failed to get all original solutions original_query' }, []];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getExerciseExpectedSolutionOriginalQueryByExerciseId(exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [
                { code: 500, message: 'Error accessing database' },
                { id: -1, original_query: '' },
            ];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT S.id, S.original_query FROM users.solutions as S WHERE S.exercise_id = $1 ORDER BY S.id LIMIT 1';
            let result = await client.query(query, [exercise_id]);
            if (result.rows[0] === undefined)
                return [
                    { code: 500, message: 'Failed to obtain solutions original_query for exercise_id: ' + exercise_id },
                    { id: -1, original_query: '' },
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows[0]];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getAllExerciseSolutionsNormalizedQueryByExerciseId(exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT S.id, S.normalized_query FROM users.solutions S WHERE S.exercise_id = $1;';
            let result = await client.query(query, [exercise_id]);
            if (result.rows[0] === undefined)
                return [
                    { code: 500, message: 'Failed to obtain all solutions normalized_query for exercise_id: ' + exercise_id },
                    [],
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async insert(exercise_id, original_query, normalized_query, abstract_syntax_tree) {
        const client = await this.pool.connect();
        if (client === undefined)
            return { code: 500, message: 'Error accessing database' };
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let insert = 'INSERT INTO users.solutions(exercise_id, original_query, normalized_query, abstract_syntax_tree) ' +
                'VALUES ($1, $2, $3, $4);';
            let result = await client.query(insert, [exercise_id, original_query, normalized_query, abstract_syntax_tree]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: 'Failed to insert new solution for exercise_id: ' + exercise_id };
            }
            await client.query('COMMIT;');
            return { code: 200, message: 'OK' };
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
}
exports.default = SolutionController;
