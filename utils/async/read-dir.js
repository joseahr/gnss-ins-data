"use strict";
var fs = require("fs");
function readDir(path) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (error, files) {
            if (error)
                return reject(error);
            resolve(files);
        });
    });
}
exports.readDir = readDir;
