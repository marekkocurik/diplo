"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
const env_config_1 = require("../env-config");
class MaintenanceController {
    constructor() {
        this.admin_pool = new Pool({
            host: env_config_1.pghost,
            database: env_config_1.pgdatabase,
            user: env_config_1.pguser_admin,
            password: env_config_1.pgpassword_admin,
            port: env_config_1.pgport,
        });
    }
    async getAllSolutionsOriginalQuery() {
        const client = await this.admin_pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'ADMIN: Error accessing database' }, []];
        try {
            let query = 'SELECT S.id, S.original_query FROM users.solutions as S WHERE S.id <= 69 ORDER BY S.id';
            let result = await client.query(query);
            if (result.rows[0] === undefined)
                return [{ code: 500, message: 'ADMIN: Failed to get all Solutions original_query' }, []];
            let genResp = { code: 200, message: 'OK' };
            let solutions = result.rows;
            return [genResp, solutions];
        }
        catch (error) {
            throw error;
        }
        finally {
            client.release();
        }
    }
    async updateSolutionOriginalQueryToUpperCaseById(solution_id, original_query) {
        const client = await this.admin_pool.connect();
        if (client === undefined)
            return { code: 500, message: 'ADMIN: Error accessing database' };
        try {
            await client.query('BEGIN;');
            let update = 'UPDATE users.solutions SET original_query = $1 WHERE id = $2';
            let result = await client.query(update, [original_query, solution_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return {
                    code: 500,
                    message: 'ADMIN: Failed to update original_query to uppercase in Solution id: ' + solution_id,
                };
            }
            await client.query('COMMIT;');
            return { code: 200, message: 'OK' };
        }
        catch (error) {
            await client.query('ROLLBACK;');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async updateSolutionNormalizedQueryById(solution_id, normalized_query) {
        const client = await this.admin_pool.connect();
        if (client === undefined)
            return { code: 500, message: 'ADMIN: Error accessing database' };
        try {
            await client.query('BEGIN;');
            let update = 'UPDATE users.solutions SET normalized_query = $1 WHERE id = $2';
            let result = await client.query(update, [normalized_query, solution_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: 'ADMIN: Failed to update normalized_query for Solution id: ' + solution_id };
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
    async updateSolutionASTById(solution_id, abstract_syntax_tree) {
        const client = await this.admin_pool.connect();
        if (client === undefined)
            return { code: 500, message: 'ADMIN: Error accessing database' };
        try {
            await client.query('BEGIN;');
            let update = 'UPDATE users.solutions SET abstract_syntax_tree = $1 WHERE id = $2';
            let result = await client.query(update, [abstract_syntax_tree, solution_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: 'ADMIN: Failed to update AST for Solution id: ' + solution_id };
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
exports.default = MaintenanceController;
