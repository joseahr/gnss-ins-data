"use strict";
var utils_1 = require("./utils");
var child_process_1 = require("child_process");
var projectDir = 'C:\\Users\\Jose\\Desktop\\Practice\\Data';
var p = new utils_1.Project(projectDir);
/**
p.buildSession(1, 35);
p.buildSession(2, 55);
p.buildSession(3, 35);
p.buildSession(4, 70);
*/
var method = 1 /* Ligado */;
console.log(method);
p.buildAllSessions(method, 35, 55, 35, 70)
    .then(function () { return p.sessions; })
    .then(function (sessionInfo) {
    console.log('Mostrando gráficas', sessionInfo.length);
    child_process_1.exec("python plot.py " + projectDir + " " + sessionInfo.length + " " + (method == 0 ? 'libre' : 'ligado'), function (err, stdout, stderr) { return console.log(err, stdout, stderr); });
});
