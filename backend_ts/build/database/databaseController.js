"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
const pool = new Pool();
// pool.on('error', (err:any, client:any) => {
// 	console.error('Unexpected error on idle client', err);
// 	process.exit(-1);
// });
// pool.on('connect', (client:any) => {
//     console.log("Connected ...");
// });
class DatabaseController {
    constructor() {
        this.pool = new Pool();
    }
}
exports.default = DatabaseController;
