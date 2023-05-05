"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = __importDefault(require("./databaseController"));
class UserController extends databaseController_1.default {
    async userEmailExists(email) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, false];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT email FROM users.users WHERE email ILIKE $1;';
            let result = await client.query(query, [email]);
            if (result.rows === undefined)
                return [{ code: 500, message: 'Failed to obtain email result' }, false];
            if (result.rows[0] !== undefined)
                return [{ code: 400, message: 'User with this email address already exist' }, true];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, false];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async insertNewUserReturningId(name, surname, email, password, salt) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, -1];
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let insert = 'INSERT INTO users.users(name, surname, email, password, salt) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
            let result = await client.query(insert, [name, surname, email, password, salt]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return [{ code: 500, message: 'Registration failed - could not create new user' }, -1];
            }
            let response = {
                code: 200,
                message: 'OK',
            };
            await client.query('COMMIT;');
            return [response, result.rows[0].id];
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async insertNewRoleReturningId(role) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, -1];
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let insert = 'INSERT INTO users.roles(name) VALUES ($1) RETURNING id;';
            let result = await client.query(insert, [role]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return [{ code: 500, message: 'Registration failed - could not create new role' }, -1];
            }
            let response = {
                code: 200,
                message: 'OK',
            };
            await client.query('COMMIT;');
            return [response, result.rows[0].id];
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async insertNewUsersToRolesByUserIdAndRoleId(user_id, role_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return { code: 500, message: 'Error accessing database' };
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let insert = 'INSERT INTO users.users_to_roles(user_id, role_id) VALUES ($1, $2)';
            let result = await client.query(insert, [user_id, role_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: 'Registration failed - could not assign role to user' };
            }
            await client.query('COMMIT;');
            return { code: 200, message: 'OK' };
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getUserCredentialsByEmail(email) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [
                { code: 500, message: 'Error accessing database' },
                { id: -1, password: '', salt: '' },
            ];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT id, password, salt FROM users.users WHERE email ILIKE $1;';
            let result = await client.query(query, [email]);
            if (result.rows[0] === undefined)
                return [
                    { code: 400, message: 'Failed to verify user credentials - user with this email does not exist' },
                    {
                        id: -1,
                        password: '',
                        salt: '',
                    },
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            let { id, password, salt } = result.rows[0];
            return [response, { id, password, salt }];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getUserRoleById(id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, ''];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT R.name FROM users.roles R ' +
                'JOIN users.users_to_roles UTR ON UTR.role_id = R.id ' +
                'JOIN users.users U ON U.id = UTR.user_id ' +
                'WHERE U.id=$1;';
            let result = await client.query(query, [id]);
            if (result.rows[0] === undefined)
                return [
                    { code: 500, message: 'Failed to verify user role - user with this ID does not have any role assigned' },
                    '',
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows[0].name];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async updateLastLoginById(id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return { code: 500, message: 'Error accessing database' };
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let query = "UPDATE users.users SET last_login = CURRENT_TIMESTAMP + INTERVAL '1 hour' WHERE id = $1;";
            let result = await client.query(query, [id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: 'Failed to update last login' };
            }
            await client.query('COMMIT;');
            return { code: 200, message: 'OK' };
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getUserCredentialsByID(id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [
                { code: 500, message: 'Error accessing database' },
                { password: '', salt: '' },
            ];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT password, salt FROM users.users WHERE id=$1;';
            let result = await client.query(query, [id]);
            if (result.rows[0] === undefined)
                return [
                    { code: 400, message: 'Failed to verify user credentials - user with this ID does not exist' },
                    {
                        password: '',
                        salt: '',
                    },
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            let { password, salt } = result.rows[0];
            return [response, { password, salt }];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async changeUserPasswordById(id, password) {
        const client = await this.pool.connect();
        if (client === undefined)
            return { code: 500, message: 'Error accessing database' };
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let query = 'UPDATE users.users SET password = $1 WHERE id = $2;';
            let result = await client.query(query, [password, id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: 'Failed to change user password' };
            }
            await client.query('COMMIT;');
            return { code: 200, message: 'OK' };
        }
        catch (e) {
            await client.query('ROLLBACK;');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getUserNameAndSurname(id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [
                { code: 500, message: 'Error accessing database' },
                { name: '', surname: '' },
            ];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT U.name, U.surname FROM users.users as U WHERE id=$1;';
            let result = await client.query(query, [id]);
            if (result.rows[0] === undefined)
                return [
                    { code: 400, message: 'Failed to obtain username' },
                    { name: '', surname: '' },
                ];
            let response = {
                code: 200,
                message: 'OK',
            };
            let { name, surname } = result.rows[0];
            return [response, { name, surname }];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getUserClusterById(user_id) {
        const client = await this.pool.connect();
        if (client === undefined)
            return [{ code: 500, message: 'Error accessing database' }, -1];
        try {
            await client.query('SET ROLE u_executioner;');
            let query = 'SELECT cluster FROM users.users WHERE id = $1;';
            let result = await client.query(query, [user_id]);
            if (result.rows[0] === undefined)
                return [{ code: 500, message: "Failed to obtain user's cluster" }, -1];
            let response = {
                code: 200,
                message: 'OK',
            };
            return [response, result.rows[0].cluster];
        }
        catch (e) {
            throw e;
        }
        finally {
            client.release();
        }
    }
    async updateUserClusterById(user_id, cluster) {
        const client = await this.pool.connect();
        if (client === undefined)
            return { code: 500, message: 'Error accessing database' };
        try {
            await client.query('SET ROLE u_executioner;');
            await client.query('BEGIN;');
            let query = 'UPDATE users.users SET cluster = $1 WHERE id = $2;';
            let result = await client.query(query, [cluster, user_id]);
            if (result.rowCount !== 1) {
                await client.query('ROLLBACK;');
                return { code: 500, message: "Failed to obtain user's cluster" };
            }
            await client.query('COMMIT;');
            return { code: 200, message: 'OK' };
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
exports.default = UserController;
