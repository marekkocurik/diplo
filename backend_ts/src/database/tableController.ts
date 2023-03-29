import DatabaseController from './databaseController';

interface GeneralResponse {
  message: string;
}

interface Solutions extends GeneralResponse {
  solutions: {
    id: number;
    query: string;
  }[];
}

interface TableColumns extends GeneralResponse {
  columns: {
    column_name: string;
  }[];
}

interface Members extends GeneralResponse {
  memid: number;
  surname: string;
  firstname: string;
  address: string;
  zipcode: number;
  telephone: string;
  recommendedby?: number;
  joindate: Date;
}

interface Facilities extends GeneralResponse {
  facid: number;
  name: string;
  membercost: number;
  guestcost: number;
  initialoutlay: number;
  monthlymaintenance: number;
}

interface Bookings extends GeneralResponse {
  bookid: number;
  facid: number;
  memid: number;
  starttime: Date;
  slots: number;
}

export default class TableController extends DatabaseController {
  //     await client.connect();

  // // Get the column names for the bookings table in the cd schema
  // const schema = 'cd';
  // const table = 'bookings';
  // const { rows: columns } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}'`);

  // // Replace `*` with column names in the SELECT statement
  // const columnNames = columns.map((column: { column_name: string }) => column.column_name);
  // const selectQuery = `SELECT ${columnNames.join(', ')} FROM ${schema}.${table}`;

  public async updateSolutionToUpperCase(id: number, query: string): Promise<[number, Object]> {
    //potrebne zmenit .env aby sa prihlasil na postgres usera a tiez zakomentovat SET ROLE u_executioner v getAllSolutions nizsie
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database' }];
    try {
      await client.query('BEGIN;');
      console.log('updating id: ', id, ' , query: ', query);
      let update = 'UPDATE users.solutions SET query = $1 WHERE id = $2';
      let result = await client.query(update, [query, id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [500, { message: 'Failed to update query_id: ' + id }];
      }
      await client.query('COMMIT;');
      return [200, { message: 'OK' }];
    } catch (e) {
      await client.query('ROLLBACK;');
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getTableColumns(schemaName: string, tableName: string): Promise<[number, TableColumns]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database', columns: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2';
      let result = await client.query(query, [schemaName, tableName]);
      if (result.rows === undefined)
        return [
          500,
          { message: 'Failed to get table columns for schema: ' + schemaName + ' , table: ' + tableName, columns: [] },
        ];
      let response = {
        message: 'OK',
        columns: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getAllSolutions(): Promise<[number, Solutions]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database', solutions: [] }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT S.id, S.query FROM users.solutions as S WHERE S.id > 9 AND S.id <= 15;';
      let result = await client.query(query);
      if (result.rows[0] === undefined) return [500, { message: 'Failed to obtain solutions.', solutions: [] }];
      let response = {
        message: 'OK',
        solutions: result.rows,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }
}
