"use strict";
var utils_1 = require("./utils");
var child_process_1 = require("child_process");
var projectDir = 'C:\\Users\\Jose\\Desktop\\Practice\\Data';
var p = new utils_1.Project(projectDir);
var delaysGNSSINS = [35, 55, 35, 70];
var delaysHoraGNSSFotosReloj = [25 * 200, 30 * 200, null, 19 * 200];
var method = 1 /* Ligado */;
console.log(method);
p.buildAllSessions(method, delaysGNSSINS, delaysHoraGNSSFotosReloj)
    .then(function () { return p.sessions; })
    .then(function (sessionInfo) {
    console.log('Mostrando gráficas', sessionInfo.length);
    child_process_1.exec("python plot.py " + projectDir + " " + sessionInfo.length + " " + (method == 0 ? 'libre' : 'ligado'), function (err, stdout, stderr) { return console.log(err, stdout, stderr); });
});
