import DatabaseController from './databaseController';

interface GeneralResponse {
  message: string;
}

interface UserCredentialsByEmail extends GeneralResponse {
  id?: number;
  password?: string;
  salt?: string;
}

interface UserRoleByID extends GeneralResponse {
  role?: string;
}

export default class UserController extends DatabaseController {
  public async getUserRoleByID(id: any): Promise<[Number, UserRoleByID]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT R.name FROM users.roles R ' +
        'JOIN users.users_to_roles UTR ON UTR.role_id = R.id ' +
        'JOIN users.users U ON U.id = UTR.user_id ' +
        'WHERE U.id=$1;';
      let result = await client.query(query, [id]);
      if (result.rows[0] === undefined)
        return [500, { message: 'User with this ID does not have any role.' }];

      let response = {
        message: 'OK',
        role: result.rows[0].name,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async getUserCredentialsByEmail(
    email: string
  ): Promise<[Number, UserCredentialsByEmail]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database' }];

    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT id, password, salt FROM users.users WHERE email ILIKE $1;';
      let result = await client.query(query, [email]);
      if (result.rows[0] === undefined)
        return [400, { message: 'User with this email does not exist.' }];

      let response = {
        message: 'OK',
        id: result.rows[0].id,
        password: result.rows[0].password,
        salt: result.rows[0].salt,
      };
      return [200, response];
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async emailExists(email: string): Promise<[Number, Object]> {
    console.log('Attempting to create client connection');
    const client = await this.pool.connect();

    console.log('Checking client');
    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    console.log('Client connection established');
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT email FROM users.users WHERE email ILIKE $1;';
      let result = await client.query(query, [email]);
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
    salt: string,
    role: string
  ): Promise<[Number, Object]> {
    const client = await this.pool.connect();

    if (client === undefined)
      return [500, { message: 'Error accessing database.' }];

    try {
      await client.query('SET ROLE u_executioner;');
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
          500,
          { message: 'Registration failed - could not insert new user.' },
        ];

      let user_id = result.rows[0].id;

      insert =
        'WITH rows AS ( ' +
        'INSERT INTO users.roles(name) VALUES ($1) RETURNING id) ' +
        'INSERT INTO users.users_to_roles(user_id, role_id) ' +
        'SELECT $2, id FROM rows RETURNING id;';

      result = await client.query(insert, [role, user_id]);

      if (result.rows[0] === undefined)
        return [
          500,
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
