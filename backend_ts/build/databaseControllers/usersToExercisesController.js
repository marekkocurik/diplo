"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class UsersToExercisesController extends databaseController_1.default {
    async getIdByUserIdAndExerciseId(user_id, exercise_id) {
        var _a;
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, -1];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT id FROM users.users_to_exercises WHERE user_id = $1 AND exercise_id = $2;';
            let result = await client.query(query, [user_id, exercise_id]);
            if (result.rows === undefined) {
                return [
                    {
                        code: 500,
                        message: 'Failed to obtain users_to_exercises id for user id: ' + user_id + ' and exercise id: ' + exercise_id,
                    },
                    -1,
                ];
            }
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.id];
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getSolvedExercisesByUserId(user_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT exercise_id FROM users.users_to_exercises WHERE user_id = $1 AND solved = true';
            let result = await client.query(query, [user_id]);
            if (result.rows === undefined)
                return [{ code: 500, message: 'Failed to obtain any user solved exercises' }, []];
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
    async getStartedExercisesByUserId(user_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT exercise_id FROM users.users_to_exercises WHERE user_id = $1 ';
            let result = await client.query(query, [user_id]);
            if (result.rows === undefined)
                return [{ code: 500, message: 'Failed to obtain any user started exercises' }, []];
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
    async insertReturningId(user_id, exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, -1];
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let insert = 'INSERT INTO users.users_to_exercises(user_id, exercise_id) VALUES ($1, $2) RETURNING id';
            let result = await client.query(insert, [user_id, exercise_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return [
                    {
                        code: 500,
                        message: 'Failed to insert new users_to_exercises for user_id: ' + user_id + ', exercise_id: ' + exercise_id,
                    },
                    -1,
                ];
            }
            // console.log('result inserting UTE: ', result);
            let response = {
                code: 200,
                message: 'OK',
            };
            await client.query('COMMIT;');
            return [response, result.rows[0].id];
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async updateToSolved(user_id, exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return { code: 500, message: 'Error accessing database' };
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let update = 'UPDATE users.users_to_exercises SET solved = true WHERE user_id = $1 AND exercise_id = $2;';
            let result = await client.query(update, [user_id, exercise_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return {
                    code: 500,
                    message: 'Failed to upadte users_to_exercises to solved for user_id: ' + user_id + ', exercise_id: ' + exercise_id,
                };
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
exports.default = UsersToExercisesController;
