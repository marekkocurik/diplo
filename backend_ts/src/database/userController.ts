import DatabaseController from './databaseController';

interface GeneralResponse {
  message: string;
}

interface Username extends GeneralResponse {
  name: string;
  surname: string;
}

interface InsertRecordReturningID extends GeneralResponse {
  id: number;
}

interface UserCredentialsByID extends GeneralResponse {
  password: string;
  salt: string;
}

interface UserCredentialsByEmail extends UserCredentialsByID {
  id: number;
}

interface UserRoleByID extends GeneralResponse {
  role: string;
}

export default class UserController extends DatabaseController {
  // public async function_name(x: any): Promise<[number, Object]> {
  //   const client = await this.pool.connect();
  //   if (client === undefined)
  //     return [500, { message: 'Error accessing database.' }];
  //   try {
  //     await client.query('SET ROLE u_executioner;');
  //     await client.query('BEGIN;');
  //     let query = '';
  //     let result = await client.query(query);
  //     if (result.rows[0] === undefined) alebo result.rowCount !== 1 alebo result.rows === undefined {
  //       await client.query('ROLLBACK;');
  //       return [500, { message: 'User with this ID does not have any role.' }];
  //     }
  //     await client.query('COMMIT;');
  //     return [200, { message: 'OK' }];
  //   } catch (e) {
  //     await client.query('ROLLBACK;');
  //     console.log(e);
  //     throw e;
  //   } finally {
  //     client.release();
  //   }
  // }

  public async emailExists(email: string): Promise<[number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT email FROM users.users WHERE email ILIKE $1;';
      let result = await client.query(query, [email]);
      if (result.rows[0] !== undefined)
        return [
          400,
          {
            message: 'Failed to assign email - another user with this email address already exist',
          },
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
  ): Promise<[number, InsertRecordReturningID]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', id: -1 }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert =
        'INSERT INTO users.users(name, surname, email, password, salt) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
      let result = await client.query(insert, [name, surname, email, password, salt]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [
          500,
          {
            message: 'Registration failed - could not create new user',
            id: -1,
          },
        ];
      }
      let response = {
        message: 'OK',
        id: result.rows[0].id,
      };
      await client.query('COMMIT;');
      return [200, response];
    } catch (e) {
      await client.query('ROLLBACK;');
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async createNewRole(role: string): Promise<[number, InsertRecordReturningID]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', id: -1 }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert = 'INSERT INTO users.roles(name) VALUES ($1) RETURNING id;';
      let result = await client.query(insert, [role]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [
          500,
          {
            message: 'Registration failed - could not create new role',
            id: -1,
          },
        ];
      }
      let response = {
        message: 'OK',
        id: result.rows[0].id,
      };
      await client.query('COMMIT;');
      return [200, response];
    } catch (e) {
      await client.query('ROLLBACK;');
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  public async assignRoleToUserByID(user_id: number, role_id: number): Promise<[number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let insert = 'INSERT INTO users.users_to_roles(user_id, role_id) VALUES ($1, $2)';
      let result = await client.query(insert, [user_id, role_id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [500, { message: 'Registration failed - could not assign role to user' }];
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

  public async getUserCredentialsByEmail(email: string): Promise<[number, UserCredentialsByEmail]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database', id: -1, password: '', salt: '' }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT id, password, salt FROM users.users WHERE email ILIKE $1;';
      let result = await client.query(query, [email]);
      if (result.rows[0] === undefined)
        return [
          400,
          {
            message: 'Failed to verify user credentials - user with this email does not exist',
            id: -1,
            password: '',
            salt: '',
          },
        ];
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

  public async getUserRoleByID(id: number): Promise<[number, UserRoleByID]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.', role: '' }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query =
        'SELECT R.name FROM users.roles R ' +
        'JOIN users.users_to_roles UTR ON UTR.role_id = R.id ' +
        'JOIN users.users U ON U.id = UTR.user_id ' +
        'WHERE U.id=$1;';
      let result = await client.query(query, [id]);
      if (result.rows[0] === undefined)
        return [
          500,
          {
            message: 'Failed to verify user role - user with this ID does not have any role assigned',
            role: '',
          },
        ];
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

  public async updateLastLoginByID(id: number): Promise<[number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database.' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let query = "UPDATE users.users SET last_login = CURRENT_TIMESTAMP + INTERVAL '1 hour' WHERE id = $1;";
      let result = await client.query(query, [id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [500, { message: 'Failed to update last login' }];
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

  public async getUserCredentialsByID(id: number): Promise<[number, UserCredentialsByID]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database', password: '', salt: '' }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT password, salt FROM users.users WHERE id=$1;';
      let result = await client.query(query, [id]);
      if (result.rows[0] === undefined)
        return [
          400,
          {
            message: 'Failed to verify user credentials - user with this ID does not exist',
            password: '',
            salt: '',
          },
        ];
      let response = {
        message: 'OK',
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

  public async changeUserPasswordByID(id: number, password: string): Promise<[number, GeneralResponse]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database' }];
    try {
      await client.query('SET ROLE u_executioner;');
      await client.query('BEGIN;');
      let query = 'UPDATE users.users SET password = $1 WHERE id = $2;';
      let result = await client.query(query, [password, id]);
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK;');
        return [500, { message: 'Failed to change user password' }];
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

  public async getUserNameAndSurname(id: number): Promise<[number, Username]> {
    const client = await this.pool.connect();
    if (client === undefined) return [500, { message: 'Error accessing database', name: '', surname: '' }];
    try {
      await client.query('SET ROLE u_executioner;');
      let query = 'SELECT U.name, U.surname FROM users.users as U WHERE id=$1;';
      let result = await client.query(query, [id]);
      if (result.rows[0] === undefined)
        return [
          400,
          {
            message: 'Failed to obtain username',
            name: '', 
            surname: '' 
          },
        ];
      let response = {
        message: 'OK',
        name: result.rows[0].name,
        surname: result.rows[0].surname,
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
