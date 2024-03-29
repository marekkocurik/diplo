"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeQuery = exports.queryToUpperCase = void 0;
const solutionsController_1 = __importDefault(require("../../../databaseControllers/solutionsController"));
const { Parser } = require('node-sql-parser/build/postgresql');
const parser = new Parser();
const opt = { database: 'PostgresQL' };
const tableController = new solutionsController_1.default();
const queryToUpperCase = (query) => {
    let i = 0;
    let str = false;
    let newQuery = query;
    while (i < newQuery.length) {
        let j = i;
        while (j < newQuery.length) {
            if (newQuery.charAt(j) === "'") {
                str = !str;
                break;
            }
            j++;
        }
        if (str || j === newQuery.length) {
            let start = newQuery.substring(0, i);
            let change = newQuery.substring(i, j).toUpperCase();
            let end = j === newQuery.length ? '' : newQuery.substring(j);
            newQuery = start + change + end;
        }
        i = j + 1;
    }
    return newQuery;
};
exports.queryToUpperCase = queryToUpperCase;
const getTablesAndAliasesFromASTObject = (obj) => {
    let results = [];
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if ('table' in obj[key]) {
                results.push({
                    table: obj[key].table,
                    as: obj[key].as,
                    column: obj[key].column,
                });
            }
            results = [...results, ...getTablesAndAliasesFromASTObject(obj[key])];
        }
    }
    return results;
};
const getTablesAndAliasesFromAST = (ast) => {
    let twa = [];
    let tmp = [];
    for (let o in ast)
        twa = [...twa, ...getTablesAndAliasesFromASTObject(ast[o])];
    for (let o of twa)
        if (o.table !== null && !tmp.find((objA) => objA.table === o.table && objA.as === o.as && objA.column === o.column))
            tmp.push(o);
    twa = [];
    for (let o of tmp)
        if (!tmp.find((objA) => objA.as === o.table))
            twa.push(o);
    return twa;
};
const getTableNamesAliasesAndColumnsFromQuery = async (query) => {
    const ast = parser.astify(query, opt);
    if (Array.isArray(ast)) {
        if (ast[0].type.toLowerCase() === 'insert')
            return [{ code: 200, message: 'OK' }, []];
    }
    else {
        if (ast.type.toLowerCase() === 'insert')
            return [{ code: 200, message: 'OK' }, []];
    }
    const tablesWithAliasesAndColumns = getTablesAndAliasesFromAST(ast);
    let tac = [];
    try {
        for (let obj of tablesWithAliasesAndColumns) {
            let [response, result] = await tableController.getAllTableColumns('cd', obj.table.toLocaleLowerCase());
            if (response.code !== 200)
                return [{ code: response.code, message: response.message }, []];
            let tmptac = {
                table: obj.table,
                as: obj.as,
                columns: result.map((x) => x.column_name),
            };
            tac.push(tmptac);
        }
    }
    catch (error) {
        return [{ code: 500, message: 'Failed' }, []];
    }
    return [{ code: 200, message: 'OK' }, tac];
};
const replaceTableAliasesWithTableName = (query, tac) => {
    let result = query;
    for (let t of tac) {
        let regex = new RegExp(`(${t.as}\\.)`, 'g');
        result = result.replace(regex, `${t.table}.`);
    }
    return result;
};
const replaceAsterixWithTableAndColumns = (query, tac) => {
    let result = query;
    let simpleAsterixRegex = new RegExp(`(?<=SELECT\\s)\\s*\\*\\s*(?=\\sFROM)`, 'g');
    let startingAsterixRegex = new RegExp(`(?<=SELECT\\s)\\s*\\*\\s*(?=,)`, 'g');
    let endingAsterixRegex = new RegExp(`(?<=,)\\s*\\*\\s*(?=\\sFROM)`, 'g');
    let betweenAsterixRegex = new RegExp(`(?<=,)\\s*\\*\\s*(?=,)`, 'g');
    let replacement = '';
    for (let t of tac) {
        for (let c of t.columns)
            replacement = replacement + t.table + '.' + c.toUpperCase() + ', ';
    }
    replacement = replacement.slice(0, -2);
    result = result.replace(simpleAsterixRegex, replacement);
    result = result.replace(startingAsterixRegex, replacement);
    result = result.replace(endingAsterixRegex, ' ' + replacement);
    result = result.replace(betweenAsterixRegex, ' ' + replacement);
    for (let t of tac) {
        replacement = '';
        let dotAsterixRegex = new RegExp(`${t.table}\\.\\*`, 'g');
        for (let c of t.columns)
            replacement = replacement + t.table + '.' + c.toUpperCase() + ', ';
        result = result.replace(dotAsterixRegex, replacement);
    }
    return result;
};
const specifyColumnsWithoutTables = (query, tac) => {
    let result = query;
    for (let t of tac) {
        for (let c of t.columns) {
            let regex = new RegExp(`(?<!\\.|AS\\s|as\\s)\\b${c}\\b`, 'gi');
            result = result.replace(regex, `${t.table}.${c.toUpperCase()}`);
        }
    }
    return result;
};
const removeTableAliases = (query, tac) => {
    let result = query;
    for (let t of tac) {
        let regex = new RegExp(`\\b(CD\\.${t.table})\\s+(as\\s+|AS\\s+)?(${t.as})\\b`, 'g');
        result = result.replace(regex, `CD.${t.table}`);
        regex = new RegExp(`\\b(${t.table})\\s+(as\\s+|AS\\s+)?(${t.as})\\b`, 'g');
        result = result.replace(regex, `${t.table}`);
    }
    return result;
};
const removeColumnAliases = (query, tac) => {
    let result = query;
    let spaces = new RegExp(`\\s+`, 'g');
    for (let t of tac) {
        for (let c of t.columns) {
            let regex = new RegExp(`(?<=SELECT\\s+(.*)?${t.table}\\.${c}\\s+)(?:as\\s+|AS\\s+)?(\\w+)(?=\\s*(?:,|FROM))`, 'gi');
            let matches = result.matchAll(regex);
            result = result.replace(regex, ``);
            for (let match of matches) {
                let columnAlias = match[0].replace(spaces, ' ').trim();
                if (columnAlias.includes('as') || columnAlias.includes('AS'))
                    columnAlias = columnAlias.split(' ')[1];
                let colRegexp = new RegExp(`[^\\.]\\b${columnAlias}\\b`, 'g');
                result = result.replace(colRegexp, ` ${t.table}.${c.toUpperCase()}`);
            }
        }
    }
    // let reg = new RegExp(`\\s+`, 'g');
    result = result.replace(spaces, ' ');
    let reg = new RegExp(`\\s,`, 'g');
    result = result.replace(reg, ',');
    return result.trim();
};
const normalizeQuery = async (query) => {
    let newQuery = (0, exports.queryToUpperCase)(query);
    try {
        let [response, tablesAliasesAndColumns] = await getTableNamesAliasesAndColumnsFromQuery(newQuery);
        if (response.code !== 200)
            return [{ code: response.code, message: response.message }, ''];
        newQuery = replaceTableAliasesWithTableName(newQuery, tablesAliasesAndColumns);
        //TODO: odstranit useless aliasy (SELECT * FROM cd.facilities as F)
        // console.log(newQuery);
        newQuery = replaceAsterixWithTableAndColumns(newQuery, tablesAliasesAndColumns);
        newQuery = specifyColumnsWithoutTables(newQuery, tablesAliasesAndColumns);
        newQuery = removeTableAliases(newQuery, tablesAliasesAndColumns);
        newQuery = removeColumnAliases(newQuery, tablesAliasesAndColumns);
        // newQuery = sortQueryAlphabetically(newQuery);
        return [{ code: 200, message: 'OK' }, newQuery];
    }
    catch (error) {
        return [{ code: 500, message: 'Something went wrong while trying to normalize query' }, ''];
    }
};
exports.normalizeQuery = normalizeQuery;
