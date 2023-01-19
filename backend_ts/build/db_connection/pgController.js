"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const { Pool } = require('pg');
exports.pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
