"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
class DatabaseController {
    constructor() {
        this.pool = new Pool();
    }
    async getAllTableColumns(schema_name, table_name) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, []];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2';
            let result = await client.query(query, [schema_name, table_name]);
            if (result.rows === undefined)
                return [
                    {
                        code: 500,
                        message: 'Failed to get table columns for table: ' + table_name + ', in schema: ' + schema_name,
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
    async getQueryResult(role, query) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [
                { code: 500, message: 'Error accessing database' },
                { queryResult: {}, executionTime: 0 },
            ];
        try {
            let setRole = `SET ROLE ${role}`;
            await client.query(setRole);
            if (query === undefined || query.trim().length === 0)
                return [
                    { code: 403, message: 'Empty query' },
                    { queryResult: {}, executionTime: 0 },
                ];
            await client.query('BEGIN;');
            const exec_start = process.hrtime();
            let result = await client.query(query);
            const exec_end = process.hrtime(exec_start);
            const exec_time = exec_end[0] * 1000 + exec_end[1] / 1000000;
            await client.query('ROLLBACK;');
            let response = {
                code: 200,
                message: 'OK',
            };
            let qRes = {
                queryResult: result.rows,
                executionTime: exec_time,
            };
            return [response, qRes];
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
exports.default = DatabaseController;
