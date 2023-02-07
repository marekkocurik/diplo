import DatabaseController from './databaseController';

// interface EmailExistsResponse {
//   emailTaken?: number;
//   message?: string;
// }

export default class UserController extends DatabaseController {
  public async emailExists(email: string): Promise<[Number, Object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database' }];

    try {
      let setRole = 'SET ROLE u_executioner;';
      let result = await client.query(setRole);
      let query = 'SELECT email FROM users.users WHERE email ILIKE $1;';
      result = await client.query(query, [email]);
      if (result.rows[0] !== undefined)
        return [
          400,
          { message: 'Another user with this email address already exist.' },
        ];
      return [200, { message: 'OK' }];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async createNewUser(
    name: string,
    surname: string,
    email: string,
    password: string,
    salt: string
  ): Promise<[Number, Object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database' }];

    try {
      let setRole = 'SET ROLE u_executioner;';
      await client.query(setRole);
      await client.query('BEGIN;');
      let insert =
        'INSERT INTO users.users(name, surname, email, password, salt) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
      let result = await client.query(insert, [
        name,
        surname,
        email,
        password,
        salt,
      ]);

      if (result.rows[0] === undefined)
        return [
          400,
          { message: 'Registration failed - could not insert new user.' },
        ];

      let user_id = result.rows[0].id;

      insert =
        'WITH rows AS (' +
        "INSERT INTO users.roles(name) VALUES ('u_student') RETURNING id)" +
        'INSERT INTO users.users_to_roles(user_id, role_id)' +
        'SELECT $1, id FROM rows RETURNING id;';

      result = await client.query(insert, [user_id]);

      if (result.rows[0] === undefined)
        return [
          400,
          { message: 'Registration failed - could not insert new role.' },
        ];

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
}
