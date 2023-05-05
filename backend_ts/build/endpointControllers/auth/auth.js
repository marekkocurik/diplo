"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsername = exports.changeUserPassword = exports.userLogin = exports.userRegistration = void 0;
const userController_1 = __importDefault(require("../../databaseControllers/userController"));
const crypto_1 = __importDefault(require("crypto"));
const crypto_js_1 = require("crypto-js");
const env_config_1 = require("../../env-config");
const jwt = require('jsonwebtoken');
const userController = new userController_1.default();
const createSalt = () => {
    return crypto_1.default.randomBytes(16).toString('hex');
};
const hashPassword = (password, salt) => {
    let hash = (0, crypto_js_1.SHA512)(password).toString();
    hash = (0, crypto_js_1.SHA512)(hash + salt).toString();
    return (0, crypto_js_1.SHA512)(hash + env_config_1.pepper).toString();
};
const createToken = (role, id, cluster) => {
    const payload = {
        role: role,
        id: id,
        cluster: cluster,
        exp: Math.floor(Date.now() / 1000) + 3600,
    };
    return jwt.sign(payload, env_config_1.jwt_secret);
};
const userRegistration = async (request, reply) => {
    const { name, surname, email, password } = request.body;
    try {
        let response;
        response = await userController.userEmailExists(email);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const salt = createSalt();
        const hPassword = hashPassword(password, salt);
        response = await userController.insertNewUserReturningId(name, surname, email, hPassword, salt);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const user_id = response[1];
        response = await userController.insertNewRoleReturningId('u_student');
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const role_id = response[1];
        response = await userController.insertNewUsersToRolesByUserIdAndRoleId(user_id, role_id);
        reply.code(response.code).send({ message: response.message });
        return;
    }
    catch (error) {
        reply.code(500).send({ message: 'Unknown error occured while trying to register new user' });
        return;
    }
};
exports.userRegistration = userRegistration;
const userLogin = async (request, reply) => {
    const { email, password } = request.body;
    try {
        let response;
        response = await userController.getUserCredentialsByEmail(email);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const user_id = response[1].id;
        const dbPassword = response[1].password;
        const dbSalt = response[1].salt;
        const hashedPassword = hashPassword(password, dbSalt);
        if (hashedPassword !== dbPassword) {
            reply.code(400).send({
                message: 'Wrong password.',
            });
            return;
        }
        response = await userController.getUserRoleById(user_id);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const role = response[1];
        response = await userController.updateLastLoginById(user_id);
        if (response.code !== 200) {
            reply.code(response.code).send({ message: response.message });
            return;
        }
        response = await userController.getUserClusterById(user_id);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const cluster = response[1];
        let token = createToken(role, user_id, cluster);
        reply.code(200).send({ message: response[0].message, token: token });
        return;
    }
    catch (e) {
        reply.code(500).send({ message: 'Unknown error occured while trying to login user' });
        return;
    }
};
exports.userLogin = userLogin;
const changeUserPassword = async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const user_id = request.query.id;
    try {
        let response;
        response = await userController.getUserCredentialsByID(user_id);
        if (response[0].code !== 200) {
            reply.code(response[0].code).send({ message: response[0].message });
            return;
        }
        const dbPassword = response[1].password;
        const dbSalt = response[1].salt;
        const hashedPassword = hashPassword(currentPassword, dbSalt);
        if (hashedPassword !== dbPassword) {
            reply.code(400).send({
                message: 'Wrong password.',
            });
            return;
        }
        const newHashedPassword = hashPassword(newPassword, dbSalt);
        response = await userController.changeUserPasswordById(user_id, newHashedPassword);
        reply.code(response.code).send({ message: response.message });
        return;
    }
    catch (e) {
        reply.code(500).send({ message: 'Unknown error occured while trying to change user password' });
        return;
    }
};
exports.changeUserPassword = changeUserPassword;
const getUsername = async (request, reply) => {
    const user_id = request.query.id;
    try {
        let response = await userController.getUserNameAndSurname(user_id);
        reply
            .code(response[0].code)
            .send({ message: response[0].message, username: response[1].name + ' ' + response[1].surname });
        return;
    }
    catch (e) {
        reply.code(500).send({ message: 'Unknown error occured while trying to obtain Username' });
        return;
    }
};
exports.getUsername = getUsername;
