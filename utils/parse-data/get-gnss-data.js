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
var TIME_DIFF = 0.005;
/**
 *
 * @param sesionNumber
 */
function ParseGNSS(projectPath, sessionNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileGNSS;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = _1.getGNNSFilePath(projectPath, sessionNumber);
                    return [4 /*yield*/, _1.readLines(filePath)];
                case 1:
                    fileGNSS = (_a.sent()).map(function (line) {
                        return line
                            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g)
                            .map(Number);
                    });
                    //console.log('fileGNSS', fileGNSS.length);
                    return [2 /*return*/, fileGNSS.map(function (actual, index, array) {
                            var anterior = array[index - 1] ? array[index - 1] : array[index];
                            var siguiente = array[index + 1] ? array[index + 1] : array[index];
                            var _a = actual.slice(1, 7), day = _a[0], month = _a[1], year = _a[2], hour = _a[3], minute = _a[4], second = _a[5];
                            var date = new Date(year, month - 1, day, hour, minute, second);
                            var _b = [anterior, actual, siguiente].map(function (array) { return array.slice(8, 11); }), lastPosition = _b[0], actualPosition = _b[1], nextPosition = _b[2], _c = _1.getVelocity(lastPosition, actualPosition, nextPosition), vN_ = _c[0], vE_ = _c[1], vD_ = _c[2], _d = _1.getAcceleration(lastPosition, actualPosition, nextPosition), aN_ = _d[0], aE_ = _d[1], aD_ = _d[2];
                            return [date].concat(actualPosition, [vN_, vE_, vD_, aN_, aE_, aD_]);
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
function ParseInertial(projectPath, sessionNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var fileAcc, fileEuler, fileInertialAcc, fileInertialEuler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileAcc = _1.getINSAccFilePath(projectPath, sessionNumber);
                    fileEuler = _1.getINSEulerFilePath(projectPath, sessionNumber);
                    return [4 /*yield*/, _1.readLines(fileAcc)];
                case 1:
                    fileInertialAcc = (_a.sent()).map(function (line) {
                        return line
                            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g)
                            .map(Number);
                    });
                    return [4 /*yield*/, _1.readLines(fileEuler)];
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
                            var anteriorAcc = array[index - 1], siguienteAcc = array[index + 1], _a = actualAcc.slice(1, 4), ax = _a[0], ay = _a[1], az = _a[2], anteriorEuler = fileInertialEuler[index - 1], actualEuler = fileInertialEuler[index], siguienteEuler = fileInertialEuler[index + 1];
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
                            _c = _1.getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az).tolist(), ax = _c[0], ay = _c[1], az = _c[2];
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
 * @param metodo : 0 libre 1 ligado . default : MetodoAjusteISNGNSS.Ligado
 * @param sesionNumber : número de sesión
 * @param delay : Tiempo de desplazamiento entre los datos GNSS e Inercial
 */
function mergeInertialGNSS(projectPath, sesionNumber, delay, metodo) {
    if (metodo === void 0) { metodo = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var gnss, inertial, _a, vN, vE, vD, data, latIner, lonIner, hIner, i, cont, _b, date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_, j, _c, time, roll, pitch, yaw, ax, ay, az, _d, aN, aE, aD, dateInertial, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, ParseGNSS(projectPath, sesionNumber)];
                case 1:
                    gnss = _j.sent();
                    return [4 /*yield*/, ParseInertial(projectPath, sesionNumber)];
                case 2:
                    inertial = _j.sent(), _a = [0, 0, 0], vN = _a[0], vE = _a[1], vD = _a[2], data = [];
                    //let minDelay = Math.ceil(gnss.length - (inertial.length/200));
                    //delay    = Math.min(delay, minDelay);
                    for (i = 0; i < gnss.length; i++) {
                        cont = -1, _b = gnss[i], date = _b[0], latGNSS = _b[1], lonGNSS = _b[2], hGNSS = _b[3], vN_ = _b[4], vE_ = _b[5], vD_ = _b[6], aN_ = _b[7], aE_ = _b[8], aD_ = _b[9];
                        if (metodo == 1 || i == 0) {
                            _e = [latGNSS, lonGNSS, hGNSS], latIner = _e[0], lonIner = _e[1], hIner = _e[2];
                            _f = [vN_, vE_, vD_], vN = _f[0], vE = _f[1], vD = _f[2];
                        }
                        //console.log(gnss[i])
                        for (j = 200 * (-delay + i); j < 200 * (-delay + i) + 200; j++) {
                            //console.log(j, i);
                            //console.log(inertial[j])
                            cont++;
                            if (!inertial[j])
                                break;
                            _c = inertial[j], time = _c[0], roll = _c[1], pitch = _c[2], yaw = _c[3], ax = _c[4], ay = _c[5], az = _c[6], _d = _1.getFreeInertialAcc(latGNSS, hGNSS, [ax, ay, az], [vN_, vE_, vD_], [aN_, aE_, aD_]), aN = _d[0], aE = _d[1], aD = _d[2], dateInertial = new Date(date.getTime() + cont * 0.05);
                            //console.log(aN, aE, aD);
                            _g = _1.getNextVelocity([vN, vE, vD], [aN, aE, aD], TIME_DIFF), vN = _g[0], vE = _g[1], vD = _g[2];
                            //console.log(vN, vE, vD);
                            // Obtenemos la posición a partir de las velocidades
                            //console.log(latIner, lonIner, hIner);
                            _h = _1.getNextPosition([latIner, lonIner, hIner], [vN, vE, vD], TIME_DIFF), latIner = _h[0], lonIner = _h[1], hIner = _h[2];
                            //console.log(latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS);
                            //console.log(dateInertial)
                            // Obtener la hora para cada observación
                            data.push([dateInertial, latIner * 180 / Math.PI, lonIner * 180 / Math.PI, hIner, latGNSS * 180 / Math.PI, lonGNSS * 180 / Math.PI, hGNSS, aN, aE, aD, aN_, aE_, aD_]);
                        }
                    }
                    //console.log(data[0], data[0].length, typeof data[0])
                    //fs.writeFile('result', data.map((el : any) => el.join(',')).join('\n'), ()=>{});
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.mergeInertialGNSS = mergeInertialGNSS;
function checkPhoto() { }
exports.checkPhoto = checkPhoto;
