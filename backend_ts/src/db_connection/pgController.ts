const { Pool } = require('pg');

export const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    port: '5432',
    // max: 20,
    // idleTimeoutMillis: 30000,
    // connectionTimeoutMillis: 2000,
});

pool.on('error', (err:any, client:any) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});