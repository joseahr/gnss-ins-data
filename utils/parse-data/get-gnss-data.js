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
var nj = require("numjs");
var mathjs = require("mathjs");
// const INSVector = [0, 0, 0]
var GPSVector = [0, 0, 0.2]; // En el iframe
var CamVector = [0.1940, 0.2540, 0.035]; // En el iframe
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
                            var anteriorAcc = array[index - 1] ? array[index - 1] : actualAcc, siguienteAcc = array[index + 1] ? array[index + 1] : actualAcc, _a = actualAcc.slice(1, 4), ax = _a[0], ay = _a[1], az = _a[2], actualEuler = fileInertialEuler[index], anteriorEuler = fileInertialEuler[index - 1] ? fileInertialEuler[index - 1] : actualEuler, siguienteEuler = fileInertialEuler[index + 1] ? fileInertialEuler[index + 1] : actualEuler;
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
        var gnss, inertial, _a, vN, vE, vD, data, latIner, lonIner, hIner, _b, date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_, cont, i, j, _c, time, roll, pitch, yaw, ax, ay, az, _d, aN, aE, aD, dateInertial, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0: return [4 /*yield*/, ParseGNSS(projectPath, sesionNumber)];
                case 1:
                    gnss = _k.sent();
                    return [4 /*yield*/, ParseInertial(projectPath, sesionNumber)];
                case 2:
                    inertial = _k.sent(), _a = [0, 0, 0], vN = _a[0], vE = _a[1], vD = _a[2], data = [], _b = [], date = _b[0], latGNSS = _b[1], lonGNSS = _b[2], hGNSS = _b[3], vN_ = _b[4], vE_ = _b[5], vD_ = _b[6], aN_ = _b[7], aE_ = _b[8], aD_ = _b[9];
                    //let minDelay = Math.ceil(gnss.length - (inertial.length/200));
                    //delay    = Math.min(delay, minDelay);
                    for (i = 0; i < gnss.length; i++) {
                        _e = gnss[i], date = _e[0], latGNSS = _e[1], lonGNSS = _e[2], hGNSS = _e[3], vN_ = _e[4], vE_ = _e[5], vD_ = _e[6], aN_ = _e[7], aE_ = _e[8], aD_ = _e[9];
                        if (metodo == 1 || i == 0) {
                            _f = [latGNSS, lonGNSS, hGNSS], latIner = _f[0], lonIner = _f[1], hIner = _f[2];
                            _g = [vN_, vE_, vD_], vN = _g[0], vE = _g[1], vD = _g[2];
                        }
                        //console.log(gnss[i])
                        cont = -1;
                        //console.log(date, cont)
                        for (j = 200 * (-delay + i); j < 200 * (-delay + i) + 200; j++) {
                            //console.log(j, i);
                            //console.log(inertial[j])
                            cont++;
                            //console.log(cont)
                            if (!inertial[j])
                                continue;
                            _c = inertial[j], time = _c[0], roll = _c[1], pitch = _c[2], yaw = _c[3], ax = _c[4], ay = _c[5], az = _c[6], _d = _1.getFreeInertialAcc(latGNSS, hGNSS, [ax, ay, az], [vN_, vE_, vD_], [aN_, aE_, aD_]), aN = _d[0], aE = _d[1], aD = _d[2], dateInertial = new Date();
                            dateInertial.setTime(date.getTime() + (cont * TIME_DIFF * 1000));
                            //console.log(dateInertial.getTime(), date, cont);
                            //console.log(aN, aE, aD);
                            _h = _1.getNextVelocity([vN, vE, vD], [aN, aE, aD], TIME_DIFF), vN = _h[0], vE = _h[1], vD = _h[2];
                            //console.log(vN, vE, vD);
                            // Obtenemos la posición a partir de las velocidades
                            //console.log(latIner, lonIner, hIner);
                            _j = _1.getNextPosition([latIner, lonIner, hIner], [vN, vE, vD], TIME_DIFF), latIner = _j[0], lonIner = _j[1], hIner = _j[2];
                            //console.log(latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS);
                            //console.log(dateInertial)
                            // Obtener la hora para cada observación
                            data.push([dateInertial.getTime(), latIner * 180 / Math.PI, lonIner * 180 / Math.PI, hIner, latGNSS * 180 / Math.PI, lonGNSS * 180 / Math.PI, hGNSS, aN, aE, aD, aN_, aE_, aD_, roll, pitch, yaw]);
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
function getPhotoDetail(projectPath, sessionNumber, mergedData, photoDelay, halfRange) {
    if (halfRange === void 0) { halfRange = 100; }
    return __awaiter(this, void 0, void 0, function () {
        var sessionInfo, photos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _1.getSessionsMetadata(projectPath)];
                case 1:
                    sessionInfo = (_a.sent())[sessionNumber - 1];
                    photos = sessionInfo.photos;
                    if (!photos || !photos.length) {
                        console.log("La sesi\u00F3n " + sessionNumber + " no tiene fotos. Skiping...");
                        return [2 /*return*/, []];
                    }
                    ;
                    photos.forEach(function (photo) { photo.updated = false; });
                    //console.log(photoDelay)
                    mergedData.forEach(function (data, index, array) {
                        // Para cada línea recorremos las fotos y comprobamos la fecha
                        //console.log(data[0]);
                        var fecha = data[0];
                        //if(index == 0) console.log(photos);
                        photos.forEach(function (photo) {
                            //console.log(photo.imgName, index, fecha);
                            if (Math.abs(fecha - photo.date.getTime()) == 0) {
                                if (photo.updated)
                                    return;
                                photo.updated = true;
                                console.log(index, sessionNumber, photo, fecha, photo.date.getTime(), photo.date.getMilliseconds());
                                halfRange = (index + photoDelay > halfRange)
                                    ? halfRange
                                    : (array.length - 1 - index - photoDelay > halfRange)
                                        ? halfRange
                                        : (array.length - 1 - index - photoDelay);
                                var latitude = 0, longitude = 0, helip = 0, roll = 0, pitch = 0, yaw = 0;
                                for (var i = index + photoDelay - halfRange; i < index + photoDelay + halfRange; i++) {
                                    var _a = array[i], dateInertial = _a[0], latIner = _a[1], lonIner = _a[2], hIner = _a[3], latGNSS = _a[4], lonGNSS = _a[5], hGNSS = _a[6], aN = _a[7], aE = _a[8], aD = _a[9], aN_ = _a[10], aE_ = _a[11], aD_ = _a[12], roll_ = _a[13], pitch_ = _a[14], yaw_ = _a[15];
                                    latitude += latIner;
                                    longitude += lonIner;
                                    helip += hIner;
                                    roll += roll_;
                                    pitch += pitch;
                                    yaw += yaw;
                                }
                                // Cordenadas en el eframe (GPS)
                                _b = [latitude, longitude, helip, roll, pitch, yaw].map(function (e) { return e / (2 * halfRange); }), latitude = _b[0], longitude = _b[1], helip = _b[2], roll = _b[3], pitch = _b[4], yaw = _b[5];
                                //console.log(latitude, longitude, helip, roll, pitch, yaw);
                                // Calcular los vectores en el camera Frame
                                var rotationMtx = _1.getRotationMatrix(roll, pitch, yaw);
                                // Obtener coordenads UTM ya que los vectores est´n en metros
                                var _c = _1.GeoToUTM([latitude * Math.PI / 180, longitude * Math.PI / 180, helip], 'GRS80'), X = _c[0], Y = _c[1], h = _c[2], _ = _c.slice(3);
                                console.log(_);
                                var _d = rotationMtx.dot(nj.array(GPSVector)).tolist(), GPSVecx = _d[0], GPSVecy = _d[1], GPSVecz = _d[2];
                                var _e = rotationMtx.dot(nj.array(CamVector)).tolist(), CamVecx = _e[0], CamVecy = _e[1], CamVecz = _e[2];
                                var _f = [X - GPSVecx, Y - GPSVecy, h - GPSVecz], XINS = _f[0], YINS = _f[1], hINS = _f[2];
                                var _g = [XINS + CamVecx, YINS + CamVecy, hINS + CamVecz], XCam = _g[0], YCam = _g[1], hCam = _g[2];
                                photo.date = new Date(mergedData[index + photoDelay][0]);
                                photo.coordinates = {
                                    utm: [XCam, YCam, hCam].map(function (num) { return num.toFixed(3); }),
                                    geo: [latitude * Math.PI / 180, longitude * Math.PI / 180, helip]
                                };
                                photo.numRow = index + photoDelay;
                                photo.attitude = [roll, pitch, yaw].map(function (num) { return num.toFixed(7); });
                                console.log(XCam, YCam, hCam, XINS, YINS, hINS, X, Y, h);
                            }
                            var _b;
                        });
                        //console.log('-------------------------------------')
                    });
                    return [2 /*return*/, photos];
            }
        });
    });
}
exports.getPhotoDetail = getPhotoDetail;
function getStops(projectPath, sessionNumber, mergedData, halfRange) {
    if (halfRange === void 0) { halfRange = 200; }
    return __awaiter(this, void 0, void 0, function () {
        var dataStops, flag;
        return __generator(this, function (_a) {
            dataStops = [];
            console.log(mergedData.length, 'abab');
            flag = false;
            mergedData.forEach(function (el, index, array) {
                if (index < halfRange)
                    return;
                if (mergedData.length - index < halfRange)
                    return;
                var y = mergedData
                    .slice(index - halfRange, index)
                    .map(function (e) { return Math.abs(e[7]); });
                //.filter( e => e >= 0 );
                var ymean = mathjs.mean(mergedData
                    .slice(index, index + halfRange)
                    .map(function (e) { return Math.abs(e[7]); }));
                if (ymean > 0.1)
                    return;
                var Y = nj.array(y);
                var a = mergedData
                    .slice(index - halfRange, index)
                    .map(function (e, i) { return [1, index - halfRange + i, e]; })
                    .map(function (e) { return e.slice(0, 2); });
                var A = nj.array(a);
                try {
                    var U = nj.array(mathjs.inv(A.T.dot(A).tolist())).dot(A.T.dot(Y)).tolist();
                }
                catch (e) {
                    return;
                }
                //console.log(Y)
                //console.log(A)
                var pendiente = U[1];
                var ordenadaAbs = U[0];
                var xcorte0 = ordenadaAbs / (-pendiente);
                if (flag && pendiente > 0)
                    flag = true;
                //console.log(index, U[0]/(-U[1]));
                if (xcorte0 < index - (halfRange / 4) || xcorte0 > index + (halfRange / 4)
                    || flag)
                    return;
                //console.log('Parada : ' + index);
                var _a = el.slice(1, 3), latitude = _a[0], longitude = _a[1], helip = _a[2];
                dataStops.push({ numRow: Math.floor(xcorte0), coordinates: { geo: [latitude * Math.PI / 180, longitude * Math.PI / 180, helip] } });
                flag = false;
            });
            return [2 /*return*/, dataStops];
        });
    });
}
exports.getStops = getStops;
