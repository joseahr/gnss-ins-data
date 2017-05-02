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
var fs = require("fs");
var RadiosCurvaturaGRS80 = new _1.RadiosCurvatura('GRS80');
var GRS80 = new _1.Elipsoide('GRS80');
var We = GRS80.getProperties().We;
var TIME_DIFF = 0.005;
/**
 *
 * @param sesionNumber
 */
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
                            ], ro = _d[0], nhu = _d[1], vN_ = latDiff * (ro + hProm), aN_ = latDiff, vE_ = lonDiff * (nhu + hProm) * Math.cos(latProm), aE_ = lonDiff * Math.cos(latProm), vD_ = -hDiff, aD_ = hDiff;
                            return [date].concat(actual.slice(8, 11), [vN_, vE_, vD_, aN_, aE_, aD_]);
                        })];
            }
        });
    });
}
exports.ParseGNSS = ParseGNSS;
/**
 *
 * @param sesionNumber
 */
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
                            //console.log(getInertialAccNFrame(roll, pitch, yaw, ax, ay, az));
                            //console.log(getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az).tolist());
                            _c = getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az).tolist(), ax = _c[0], ay = _c[1], az = _c[2];
                            return [actualAcc[0], roll, pitch, yaw, ax, ay, az];
                            var _c;
                        })];
            }
        });
    });
}
exports.ParseInertial = ParseInertial;
/**
 * @name mergeInertialGNSS
 * @param sesionNumber : número de sesión
 * @param delay : Tiempo de desplazamiento entre los datos GNSS e Inercial
 */
function mergeInertialGNSS(sesionNumber, delay) {
    return __awaiter(this, void 0, void 0, function () {
        var gnss, inertial, data, minDelay, _a, vN, vE, vD, i, _b, date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_, gn, j, _c, time, roll, pitch, yaw, ax, ay, az, aN, aE, aD, ro, nhu, latIner, lonIner, hIner, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, ParseGNSS(sesionNumber)];
                case 1:
                    gnss = _e.sent();
                    return [4 /*yield*/, ParseInertial(sesionNumber)];
                case 2:
                    inertial = _e.sent();
                    data = [];
                    console.log(delay, Math.floor(gnss.length - (inertial.length / 200)));
                    minDelay = Math.ceil(gnss.length - (inertial.length / 200));
                    delay = Math.max(delay, minDelay);
                    _a = [0, 0, 0], vN = _a[0], vE = _a[1], vD = _a[2];
                    for (i = delay; i < gnss.length; i++) {
                        _b = gnss[i], date = _b[0], latGNSS = _b[1], lonGNSS = _b[2], hGNSS = _b[3], vN_ = _b[4], vE_ = _b[5], vD_ = _b[6], aN_ = _b[7], aE_ = _b[8], aD_ = _b[9], gn = _1.somigliana(latGNSS, hGNSS);
                        //console.log(gn);
                        for (j = 200 * (i - delay); j < 200 * (i - delay) + 200; j++) {
                            _c = inertial[j], time = _c[0], roll = _c[1], pitch = _c[2], yaw = _c[3], ax = _c[4], ay = _c[5], az = _c[6], aN = ax + gn[0] - 2 * We * vE_ * Math.sin(latGNSS) + aN_ * vD_ - aE_ * vE_ * Math.sin(latGNSS), aE = ay + gn[1] - 2 * We * vN_ * Math.sin(latGNSS) + 2 * We * vD_ * Math.cos(latGNSS) + aE_ * vN_ * Math.sin(latGNSS) + aE_ * vD_ * Math.cos(latGNSS), aD = az + gn[2] - 2 * We * vE_ * Math.cos(latGNSS) - aE_ * vN_ * Math.cos(latGNSS) - aN_ * vN_;
                            //console.log(aN, aE, aD);
                            _d = [
                                vN + aN * TIME_DIFF,
                                vE + aE * TIME_DIFF,
                                vD + aD * TIME_DIFF
                            ], vN = _d[0], vE = _d[1], vD = _d[2];
                            ro = RadiosCurvaturaGRS80.getRadioElipseMeridiana(latGNSS), nhu = RadiosCurvaturaGRS80.getRadioPrimerVertical(latGNSS), latIner = latGNSS + ((vN * TIME_DIFF) / (ro + hGNSS)), lonIner = lonGNSS + ((vE * TIME_DIFF) / (nhu + hGNSS) * Math.cos(latGNSS)), hIner = hGNSS + vD * TIME_DIFF;
                            //console.log(latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS);
                            data.push([latIner * 180 / Math.PI, lonIner * 180 / Math.PI, hIner, latGNSS * 180 / Math.PI, lonGNSS * 180 / Math.PI, hGNSS].join(','));
                        }
                    }
                    fs.writeFile('result', data.join('\n'), function () { });
                    return [2 /*return*/];
            }
        });
    });
}
exports.mergeInertialGNSS = mergeInertialGNSS;
/**
 * @name getInertialAccNFrameRotated
 * @param roll
 * @param pitch
 * @param yaw
 * @param accx
 * @param accy
 * @param accz
 */
function getInertialAccNFrameRotated(roll, pitch, yaw, accx, accy, accz) {
    var rotMatrix = nj.array([[1, 0, 0], [0, -1, 0], [0, 0, -1]]);
    var accNFrame = getInertialAccNFrame(roll, pitch, yaw, accx, accy, accz);
    return rotMatrix.dot(accNFrame);
}
exports.getInertialAccNFrameRotated = getInertialAccNFrameRotated;
/**
 *
 * @param roll
 * @param pitch
 * @param yaw
 * @param accx
 * @param accy
 * @param accz
 */
function getInertialAccNFrame(roll, pitch, yaw, accx, accy, accz) {
    var rotMatrix = getRotationMatrix(roll, pitch, yaw);
    var accVector = nj.array([accx, accy, accz]);
    return rotMatrix.dot(accVector);
}
exports.getInertialAccNFrame = getInertialAccNFrame;
/**
 *
 * @param roll
 * @param pitch
 * @param yaw
 */
function getRotationMatrix(roll, pitch, yaw) {
    var c11 = Math.cos(pitch) * Math.cos(yaw), c12 = Math.sin(roll) * Math.sin(pitch) * Math.cos(yaw) - Math.cos(roll) * Math.sin(yaw), c13 = Math.cos(roll) * Math.sin(pitch) * Math.cos(yaw) + Math.sin(roll) * Math.sin(yaw), c21 = Math.cos(pitch) * Math.sin(yaw), c22 = Math.sin(roll) * Math.sin(pitch) * Math.sin(yaw) + Math.cos(roll) * Math.cos(yaw), c23 = Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw) - Math.sin(roll) * Math.cos(yaw), c31 = -(Math.sin(pitch)), c32 = Math.sin(roll) * Math.cos(pitch), c33 = Math.cos(roll) * Math.cos(pitch);
    return nj.array([[c11, c12, c13], [c21, c22, c23], [c31, c32, c33]]);
}
exports.getRotationMatrix = getRotationMatrix;
