"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
const pool = new Pool({
    password: "postgres"
});
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
pool.on('connect', (client) => {
    console.log("Connected ...");
});
class DBController {
    constructor() { }
    async testDB() {
        const client = await pool.connect();
        if (client === undefined)
            return console.error('Error acquiring client');
        try {
            // await client.query('BEGIN');
            const queryText = 'SELECT * FROM exercises.members;';
            // const result = await client.query(queryText, [password, id]);
            const result = await client.query(queryText);
            // await client.query('COMMIT');
            // return result;
            return [200, { message: result.rows }];
        }
        catch (e) {
            // await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
}
exports.default = DBController;