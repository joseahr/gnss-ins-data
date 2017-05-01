"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _1 = require("../");
var nj = require("numjs");
var RadiosCurvaturaGRS80 = new _1.RadiosCurvatura('GRS80');
function ParseGNSS(sesionNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var fileGNSS;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _1.readLines('../GNSSdata_ses1.txt')];
                case 1:
                    fileGNSS = (_a.sent()).map(function (line) {
                        return line
                            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g)
                            .map(Number);
                    });
                    return [2 /*return*/, fileGNSS.map(function (actual, index, array) {
                            var anterior = array[index - 1];
                            var _a = actual.slice(1, 7), day = _a[0], month = _a[1], year = _a[2], hour = _a[3], minute = _a[4], second = _a[5];
                            //console.log(day, month, year, hour, minute, second);
                            var date = new Date(year, month - 1, day, hour, minute, second);
                            //console.log(date.toLocaleString())
                            if (!anterior) {
                                // Devolvemos fecha, lat, lon, h, vN, vE, vD, aN, aE, aD
                                return [date].concat(actual.slice(8, 11), [0, 0, 0, 0, 0, 0]);
                            }
                            //console.log(anterior, actual);
                            var _b = actual.slice(8, 11), latAct = _b[0], lonAct = _b[1], hAct = _b[2];
                            var _c = anterior.slice(8, 11), latAnt = _c[0], lonAnt = _c[1], hAnt = _c[2];
                            //console.log(latAct, lonAct, hAct);
                            var latProm = (latAct + latAnt) / 2, latDiff = (latAct - latAnt), lonProm = (lonAct + lonAnt) / 2, lonDiff = (lonAct - lonAnt), hProm = (hAct + hAnt) / 2, hDiff = (hAct - hAnt), _d = [
                                RadiosCurvaturaGRS80.getRadioElipseMeridiana(latProm),
                                RadiosCurvaturaGRS80.getRadioPrimerVertical(latProm)
                            ], ro = _d[0], nhu = _d[1], vN = latDiff * (ro + hProm), aN = latDiff, vE = lonDiff * (nhu + hProm) * Math.cos(latProm), aE = lonDiff * Math.cos(latProm), vD = -hDiff, aD = hDiff;
                            return [date].concat(actual.slice(8, 11), [vN, vE, vD, aN, aE, aD]);
                        })];
            }
        });
    });
}
exports.ParseGNSS = ParseGNSS;
function ParseInertial(sesionNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var fileInertialAcc, fileInertialEuler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _1.readLines('../MT_calib_ses1.txt')];
                case 1:
                    fileInertialAcc = (_a.sent()).map(function (line) {
                        return line
                            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g)
                            .map(Number);
                    });
                    return [4 /*yield*/, _1.readLines('../MT_euler_ses1.txt')];
                case 2:
                    fileInertialEuler = (_a.sent()).map(function (line) {
                        return line
                            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g)
                            .map(Number);
                    });
                    //console.log(fileInertialAcc.length, fileInertialEuler.length);
                    if (fileInertialAcc.length !== fileInertialEuler.length) {
                        throw "Los archivos MT_euler y MT_calib deben tener el mismo n\u00FAmero de l\u00EDneas";
                    }
                    return [2 /*return*/, fileInertialAcc.map(function (actualAcc, index, array) {
                            var anteriorAcc = array[index - 1];
                            var siguienteAcc = array[index + 1];
                            var _a = actualAcc.slice(1, 4), ax = _a[0], ay = _a[1], az = _a[2];
                            var anteriorEuler = fileInertialEuler[index - 1];
                            var actualEuler = fileInertialEuler[index];
                            var siguienteEuler = fileInertialEuler[index + 1];
                            var _b = actualEuler
                                .slice(1, 4)
                                .map(function (ang) { return ang * Math.PI / 180; }), roll = _b[0], pitch = _b[1], yaw = _b[2];
                            // Rellenamos los valores de aceleración faltantes
                            // Debido a huecos en el archivo
                            if ([ax, ay, az].some(function (el) { return el === 0; })) {
                                ax = (anteriorAcc[1] + siguienteAcc[1]) / 2;
                                ay = (anteriorAcc[2] + siguienteAcc[2]) / 2;
                                az = (anteriorAcc[3] + siguienteAcc[3]) / 2;
                            }
                            // Rellenamos los valores faltante de ángulos de euler
                            if ([roll, pitch, yaw].some(function (el) { return el === 0; })) {
                                roll = ((anteriorEuler[1] + siguienteEuler[1]) / 2) * Math.PI / 180;
                                pitch = ((anteriorEuler[2] + siguienteEuler[2]) / 2) * Math.PI / 180;
                                yaw = ((anteriorEuler[3] + siguienteEuler[3]) / 2) * Math.PI / 180;
                            }
                            //console.log(ax, ay, az, roll, pitch, yaw);
                            //console.log(getRotationMatrix(roll, pitch, yaw));
                            console.log(getInertialAccNFrame(roll, pitch, yaw, ax, ay, az));
                            console.log(getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az));
                            return [actualAcc[0], ax, ay, az, roll, pitch, yaw];
                        })];
            }
        });
    });
}
exports.ParseInertial = ParseInertial;
function mergeInertialGNSS(sesionNumber) {
}
exports.mergeInertialGNSS = mergeInertialGNSS;
function getInertialAccNFrameRotated(roll, pitch, yaw, accx, accy, accz) {
    var rotMatrix = nj.array([[1, 0, 0], [0, -1, 0], [0, 0, -1]]);
    var accNFrame = getInertialAccNFrame(roll, pitch, yaw, accx, accy, accz);
    return rotMatrix.dot(accNFrame);
}
exports.getInertialAccNFrameRotated = getInertialAccNFrameRotated;
function getInertialAccNFrame(roll, pitch, yaw, accx, accy, accz) {
    var rotMatrix = getRotationMatrix(roll, pitch, yaw);
    var accVector = nj.array([accx, accy, accz]);
    return rotMatrix.dot(accVector);
}
exports.getInertialAccNFrame = getInertialAccNFrame;
function getRotationMatrix(roll, pitch, yaw) {
    var c11 = Math.cos(pitch) * Math.cos(yaw), c12 = Math.sin(roll) * Math.sin(pitch) * Math.cos(yaw) - Math.cos(roll) * Math.sin(yaw), c13 = Math.cos(roll) * Math.sin(pitch) * Math.cos(yaw) + Math.sin(roll) * Math.sin(yaw), c21 = Math.cos(pitch) * Math.sin(yaw), c22 = Math.sin(roll) * Math.sin(pitch) * Math.sin(yaw) + Math.cos(roll) * Math.cos(yaw), c23 = Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw) - Math.sin(roll) * Math.cos(yaw), c31 = -(Math.sin(pitch)), c32 = Math.sin(roll) * Math.cos(pitch), c33 = Math.cos(roll) * Math.cos(pitch);
    return nj.array([[c11, c12, c13], [c21, c22, c23], [c31, c32, c33]]);
}
exports.getRotationMatrix = getRotationMatrix;
