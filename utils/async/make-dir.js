"use strict";
var fs = require("fs");
var path = require("path");
function makeDir(path_, dirName) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(path.join(path_, dirName), function (err) { return resolve(); });
    });
}
exports.makeDir = makeDir;
