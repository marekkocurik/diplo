"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class ExerciseController extends databaseController_1.default {
    async getExercise(exerciseId) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [500, { message: 'Error accessing database.' }];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT E.id, E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
            let result = await client.query(query, [exerciseId]);
            if (result.rows[0] === undefined)
                return [500, { message: 'Error acquiring exercise from database.' }];
            query =
                'SELECT S.query FROM users.solutions S JOIN users.exercises E ON E.id = S.exercise_id WHERE S.exercise_id=$1 LIMIT 1;';
            let solution = await client.query(query, [exerciseId]);
            if (solution.rows[0] === undefined)
                return [500, { message: 'Error acquiring exercise from database.' }];
            result.rows[0].solution = solution.rows[0].query;
            return [200, result.rows[0]];
        }
        catch (e) {
            return [500, { message: 'Failed to acquire exercise' }];
        }
        finally {
            client.release();
        }
    }
    // public async getExpectedResult(
    //   exerciseId: number
    // ): Promise<[number, object]> {
    //   const client = await this.pool.connect();
    //   if (client === undefined)
    //     return [500, { message: 'Error accessing database.' }];
    //   try {
    //     await client.query('SET ROLE u_executioner;');
    //     let solutionResult = "SELECT S.query FROM users.solutions AS S JOIN users.exercises as E ON E.id = S.exercise_id WHERE S.exercise_id=$1"
    //     let solution = await client.query(solutionResult, [exerciseId]);
    //     // console.log(solution.rows[0].query);
    //     let result = await client.query(solution.rows[0].query);
    //     // console.log(result.rows)
    //     return [200, result.rows];
    //   } catch (e) {
    //     // await client.query('ROLLBACK');
    //     return [500, { message: "Error occured while trying to access expected result" }];
    //   } finally {
    //     client.release();
    //   }
    // }
    async getExerciseTree() {
        const client = await this.pool.connect();
        if (client === undefined)
            return [500, { message: 'Error accessing database.' }];
        try {
            const obj = [];
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT C.id, C.name FROM users.chapters C ORDER BY C.chapter_order;';
            let result = await client.query(query);
            if (result.rows[0] === undefined)
                return [500, { message: 'Error acquiring chapters from database.' }];
            let res;
            query =
                'SELECT E.id, E.name FROM users.exercises E WHERE E.chapter_id=$1 ORDER BY E.exercise_order;';
            let i = 1;
            for (let x of result.rows) {
                res = await client.query(query, [x.id]);
                if (res.rows[0] === undefined)
                    return [
                        500,
                        {
                            message: 'Error acquiring exercises from database for chapter: ' +
                                x.id +
                                '.',
                        },
                    ];
                let j = 1;
                for (let y of res.rows)
                    y._id = j++;
                x._id = i++;
                x.exercises = res.rows;
                obj.push(x);
            }
            return [200, result.rows];
        }
        catch (e) {
            return [500, { message: 'Failed to acquire exercise tree' }];
        }
        finally {
            client.release();
        }
    }
    async getQueryResult(role, query) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [500, { message: 'Error accessing database.' }];
        try {
            let setRole = `SET ROLE ${role}`;
            await client.query(setRole);
            if (query === undefined)
                return [400, { message: 'Empty query' }];
            await client.query('BEGIN');
            let result = await client.query(query);
            await client.query('ROLLBACK');
            return [200, result.rows];
        }
        catch (e) {
            await client.query('ROLLBACK');
            if (e instanceof Error)
                return [400, { message: e.message }];
            return [
                400,
                { message: 'Unknown error occured while trying to execute query' },
            ];
        }
        finally {
            client.release();
        }
    }
}
exports.default = ExerciseController;
