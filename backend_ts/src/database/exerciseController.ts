import DatabaseController from "./databaseController";

export default class ExerciseController extends DatabaseController {
    public async executeQuery(
        role: string,
        query: string
      ): Promise<[number, object]> {
        const client = await this.pool.connect();
        if (client === undefined) {
          console.error('Error acquiring client');
          return [500, { message: 'Error accessing database' }];
        }
        try {
          // await client.query('BEGIN');
          // const queryText = 'SELECT * FROM exercises.members;';
          // const result = await client.query(queryText, [password, id]);
          // const result = await client.query(queryText);
          // await client.query('COMMIT');
          // return result;
          // return [200, {message: result.rows}];
    
          //   const ro = 'SET ROLE u_student';
          //   const sel = 'SELECT * FROM cd.members;';
          // const qselect = "SELECT * FROM exercises.test_view;";
          // const qinsert = "INSERT INTO exercises.test_view2(memid, surname, firstname, address) VALUES (13, 'surname3', 'firstname3', 'addr3');";
          //   let result = await client.query(ro);
          //   result = await client.query(sel);
          // await client.query('BEGIN');
          // await client.query(qinsert);
          // await client.query(qinsert);
          // await client.query(qinsert);
          // await client.query(qinsert);
          // let res2 = await client.query(qselect);
          // console.log(result.rows);
    
          //   let queryText = 'SELECT id FROM riot_account WHERE username=$1';
          //   const verify = await client.query(queryText, [riotName]);
        
          let setRole = `SET ROLE ${role}`;
          let roleResult = await client.query(setRole);
          console.log(roleResult.rows);
          let result = await client.query(query);
          return [200, { message: result.rows }];
        } catch (e) {
          // await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      }
}