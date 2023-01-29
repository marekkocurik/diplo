const { Pool } = require('pg');

const pool = new Pool();

pool.on('error', (err:any, client:any) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

pool.on('connect', (client:any) => {
    console.log("Connected ...");
});

export default class DBController {

    constructor(){}

    public async testDB() {
        const client = await pool.connect();
    	if(client === undefined)
    		return console.error('Error acquiring client');
    	try {
    		// await client.query('BEGIN');
    		// const queryText = 'SELECT * FROM exercises.members;';
    		// const result = await client.query(queryText, [password, id]);
            // const result = await client.query(queryText);
    		// await client.query('COMMIT');
    		// return result;
            // return [200, {message: result.rows}];

			const ro = "SET default_transaction_read_only=OFF;";
			const sel ="SELECT current_user;";
			// const qselect = "SELECT * FROM exercises.test_view;";
			// const qinsert = "INSERT INTO exercises.test_view2(memid, surname, firstname, address) VALUES (13, 'surname3', 'firstname3', 'addr3');";
			let result = await client.query(ro);
			result = await client.query(sel);
			// await client.query('BEGIN');
			// await client.query(qinsert);
			// await client.query(qinsert);
			// await client.query(qinsert);
			// await client.query(qinsert);
			// let res2 = await client.query(qselect);
			console.log(result.rows);
    	} catch(e) {
    		// await client.query('ROLLBACK');
    		throw e;
    	} finally {
    		client.release();
    	}
    }
}