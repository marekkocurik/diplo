"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class ExerciseController extends databaseController_1.default {
    async getExerciseById(exercise_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [
                { code: 500, message: 'Error accessing database' },
                {
                    id: -1,
                    name: '',
                    question: '',
                },
            ];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT E.id, E.name, E.question, E.schema FROM users.exercises E WHERE E.id=$1;';
            let result = await client.query(query, [exercise_id]);
            if (result.rows[0] === undefined)
                return [
                    { code: 500, message: 'Failed to obtain exercise' },
                    {
                        id: -1,
                        name: '',
                        question: '',
                    },
                ];
            let response = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                question: result.rows[0].question,
            };
            return [{ code: 200, message: 'OK' }, response];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getTreeExercisesByChapterId(chapter_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT E.id, E.name FROM users.exercises E WHERE E.chapter_id=$1 ORDER BY E.exercise_order;';
            let result = await client.query(query, [chapter_id]);
            if (result.rows === undefined)
                return [{ code: 500, message: 'Failed to obtain exercises for Chapter id: ' + chapter_id }, []];
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
}
exports.default = ExerciseController;
