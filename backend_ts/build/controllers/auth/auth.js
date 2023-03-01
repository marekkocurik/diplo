"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegistration = exports.userLogin = void 0;
const userController_1 = __importDefault(require("../../database/userController"));
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
const createToken = (role) => {
    const payload = {
        role: role,
        exp: Math.floor(Date.now() / 1000) + 3600,
    };
    return jwt.sign(payload, env_config_1.jwt_secret);
};
const userLogin = async (request, reply) => {
    const { email, password } = request.body;
    let [code, response] = await userController.getUserCredentialsByEmail(email);
    if (code !== 200) {
        reply.code(code).send(response);
        return;
    }
    const dbID = response.id;
    const dbPassword = response.password;
    const dbSalt = response.salt;
    const hashedPassword = hashPassword(password, dbSalt);
    if (hashedPassword !== dbPassword) {
        reply.code(400).send({ message: 'Wrong password.' });
        return;
    }
    let [_code, _response] = await userController.getUserRoleByID(dbID);
    if (_code !== 200) {
        reply.code(_code).send(_response);
        return;
    }
    let token = createToken(_response.role);
    reply.code(200).send({ message: 'OK', token: token });
    return;
};
exports.userLogin = userLogin;
const userRegistration = async (request, reply) => {
    const { name, surname, email, password } = request.body;
    let [code, response] = await userController.emailExists(email);
    if (code !== 200) {
        reply.code(code).send(response);
        return;
    }
    const salt = createSalt();
    const hPassword = hashPassword(password, salt);
    [code, response] = await userController.createNewUser(name, surname, email, hPassword, salt, 'u_student');
    reply.code(code).send(response);
    return;
};
exports.userRegistration = userRegistration;
