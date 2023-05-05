"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class ChaptersController extends databaseController_1.default {
    async getAllChapters() {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT C.id, C.name FROM users.chapters C ORDER BY C.chapter_order;';
            let result = await client.query(query);
            if (result.rows === undefined)
                return [{ code: 500, message: 'Failed to obtain chapters' }, []];
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
exports.default = ChaptersController;
