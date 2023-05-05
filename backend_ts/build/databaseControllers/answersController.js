"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class AnswersController extends databaseController_1.default {
    async getAllUserExerciseSolutionAnswersByUserIdAndExerciseId(user_id, exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT A.id, A.query FROM users.answers as A ' +
                'JOIN users.users_to_exercises UTE on UTE.id = A.users_to_exercises_id ' +
                "WHERE UTE.exercise_id = $1 AND UTE.user_id = $2 AND A.solution_success = 'COMPLETE' ORDER BY A.id DESC;";
            let result = await client.query(query, [exercise_id, user_id]);
            if (result.rows === undefined)
                return [
                    {
                        code: 500,
                        message: 'Failed to obtain user exercise solution answers for User id: ' +
                            user_id +
                            ', for Exercise id: ' +
                            exercise_id,
                    },
                    [],
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows];
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getAllUserExerciseAnswersByExerciseIdAndUserId(exercise_id, user_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 
            // 'SELECT A.id, A.query, A.solution_success, A.submit_attempt, A.execution_time, A.date FROM users.answers A ' +
            // 'JOIN users.exercises E ON E.id = A.exercise_id ' +
            // 'JOIN users.users U ON U.id = A.user_id ' +
            // 'WHERE A.exercise_id = $1 AND A.user_id = $2 ' +
            // 'ORDER BY A.id DESC;';
            'SELECT A.id, A.query, A.solution_success, A.submit_attempt, A.execution_time, A.date ' +
                'FROM users.answers A ' +
                'JOIN users.users_to_exercises UTE on UTE.id = A.users_to_exercises_id ' +
                'WHERE UTE.user_id = $1 AND UTE.exercise_id = $2 ' +
                'ORDER BY A.id DESC;';
            let result = await client.query(query, [user_id, exercise_id]);
            if (result.rows === undefined)
                return [
                    {
                        code: 500,
                        message: 'Failed to obtain user exercise answers for user_id: ' + user_id + ', for exercise_id: ' + exercise_id,
                    },
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
    async insertReturningId(users_to_exercises_id, query, solution_success, submit_attempt, execution_time) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, -1];
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let insert = 'INSERT INTO users.answers(users_to_exercises_id, query, solution_success, submit_attempt, execution_time, date) ' +
                "VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '1 hour') RETURNING id";
            let result = await client.query(insert, [
                users_to_exercises_id,
                query,
                solution_success,
                submit_attempt,
                execution_time,
            ]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return [
                    {
                        code: 500,
                        message: 'Failed to insert new answer for users_to_exercises_id: ' + users_to_exercises_id,
                    },
                    -1,
                ];
            }
            await client.query('COMMIT;');
            return [{ code: 200, message: 'OK' }, result.rows[0].id];
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
exports.default = AnswersController;
