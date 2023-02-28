"use strict";
// const e_vars = {
//   	port: process.env.PORT || 8080,
// 	pepper: process.env.PEPPER,
// 	jwt_secret: process.env.JWT_SECRET,
// };
Object.defineProperty(exports, "__esModule", { value: true });
exports.fe_ip_address = exports.jwt_secret = exports.pepper = void 0;
// export default e_vars;
exports.pepper = process.env.PEPPER;
exports.jwt_secret = process.env.JWT_SECRET;
exports.fe_ip_address = process.env.FE_IP_ADDRESS || 'http://localhost:5173';
