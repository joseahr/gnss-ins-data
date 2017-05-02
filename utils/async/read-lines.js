"use strict";
var readline = require("readline");
var fs = require("fs");
/**
 * @function readLines
 * @summary  Devuelve una promesa que almacenará las líneas leídas del fichero
 * @param    path : Ruta hacia el fichero
 */
function readLines(path) {
    var lines = [];
    var lineReader = readline.createInterface({
        input: fs.createReadStream(path)
    });
    lineReader.on('line', function (line) { return lines.push(line); });
    return new Promise(function (resolve, reject) {
        lineReader.on('close', function () { return resolve(lines); });
    });
}
exports.readLines = readLines;
