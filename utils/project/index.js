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
var path = require("path");
var fs = require("fs");
var open = require("opn");
var clc = require("cli-color");
var errorLog = clc.red.bold;
var warnLog = clc.yellow;
var noticeLog = clc.blue;
var mapHtmlPath = path.join(__dirname, '../../map/index.html');
var Project = (function () {
    function Project(path_) {
        var _this = this;
        this.path_ = path_;
        this.mapHtml = (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, _1.readLines(mapHtmlPath).then(function (lines) { return lines.join('\n'); })];
        }); }); })();
        this.sessions = _1.getSessionsMetadata(path_);
        //.then( metadata => this.sessions = metadata)
        //.then( ()=> console.log(this.sessions))
    }
    Project.prototype.buildSession = function (sessionNumber, delay, method, photoDelay) {
        return __awaiter(this, void 0, void 0, function () {
            var dataMerged, sessionPath, photoDetail, stops, mapStr_1, stopsPath, mapPath_1, mapStr, photosPath, mapPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.mergeInertialGNSS(this.path_, sessionNumber, delay, method)];
                    case 1:
                        dataMerged = _a.sent();
                        sessionPath = path.join(this.path_, 'results', "" + (method == 0 ? 'libre' : 'ligado'), "ses" + sessionNumber);
                        fs.writeFile(sessionPath, dataMerged.map(function (el) { return el.join(','); }).join('\n'), function () { });
                        console.log(noticeLog("Datos para la sesi\u00F3n " + sessionNumber + " calculados correctamente"));
                        return [4 /*yield*/, _1.getPhotoDetail(this.path_, sessionNumber, dataMerged, photoDelay, 100)];
                    case 2:
                        photoDetail = _a.sent();
                        if (!(!photoDetail || !photoDetail.length))
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, _1.getStops(this.path_, sessionNumber, dataMerged, 125)];
                    case 3:
                        stops = _a.sent();
                        return [4 /*yield*/, this.buildDataForMap(sessionNumber, dataMerged, stops)];
                    case 4:
                        mapStr_1 = _a.sent();
                        stopsPath = path.join(this.path_, 'results', "" + (method == 0 ? 'libre' : 'ligado'), "photos_ses" + sessionNumber + ".json");
                        fs.writeFile(stopsPath, JSON.stringify(stops, null, '\t'), function () { });
                        mapPath_1 = path.join(this.path_, 'results', "" + (method == 0 ? 'libre' : 'ligado'), "ses" + sessionNumber + ".html");
                        fs.writeFile(mapPath_1, mapStr_1, function () { open(mapPath_1, { app: 'firefox' }); });
                        return [2 /*return*/];
                    case 5: return [4 /*yield*/, this.buildDataForMap(sessionNumber, dataMerged, photoDetail)];
                    case 6:
                        mapStr = _a.sent();
                        photosPath = path.join(this.path_, 'results', "" + (method == 0 ? 'libre' : 'ligado'), "photos_ses" + sessionNumber + ".json");
                        fs.writeFile(photosPath, JSON.stringify(photoDetail, null, '\t'), function () { });
                        mapPath = path.join(this.path_, 'results', "" + (method == 0 ? 'libre' : 'ligado'), "ses" + sessionNumber + ".html");
                        fs.writeFile(mapPath, mapStr, function () { open(mapPath, { app: 'firefox' }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.buildAllSessions = function (method, delays, photoDelays) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var sessionsInfo, resultDir, resultMethodDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sessions];
                    case 1:
                        sessionsInfo = _a.sent();
                        return [4 /*yield*/, _1.makeDir(this.path_, 'results')];
                    case 2:
                        resultDir = _a.sent();
                        return [4 /*yield*/, _1.makeDir(path.join(this.path_, 'results'), method == 0 ? 'libre' : 'ligado')];
                    case 3:
                        resultMethodDir = _a.sent();
                        return [4 /*yield*/, Promise.all(sessionsInfo.map(function (element, index) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log(noticeLog("Calculando datos para la sesi\u00F3n " + (index + 1)));
                                            return [4 /*yield*/, this.buildSession(index + 1, delays[index], method, photoDelays[index])];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Project.prototype.buildDataForMap = function (sessionNumber, dataMerged, photosOrStops) {
        return __awaiter(this, void 0, void 0, function () {
            var htmlstr, _a, dataStrGPS, dataStrIner, dataStopsPhotos;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = ' ';
                        return [4 /*yield*/, this.mapHtml];
                    case 1:
                        htmlstr = (_a + (_b.sent())).slice(1);
                        dataStrGPS = "" + JSON.stringify(dataMerged.filter(function (e, idx) { return idx % 200 == 0; }).map(function (e) { return e.slice(1, 3).reverse(); }), null, '\t');
                        dataStrIner = "" + JSON.stringify(dataMerged.map(function (e) { return e.slice(1, 3).reverse(); }), null, '\t');
                        dataStopsPhotos = "" + JSON.stringify(photosOrStops.map(function (e) { return e.coordinates.geo.slice(0, 2).map(function (c) { return c * 180 / Math.PI; }).reverse(); }), null, '\t');
                        return [2 /*return*/, htmlstr
                                .replace('{{dataGPS}}', dataStrGPS)
                                .replace('{{dataIner}}', dataStrIner)
                                .replace('{{photosOrStops}}', dataStopsPhotos)
                                .replace('{{title}}', "Sesi\u00F3n " + sessionNumber)];
                }
            });
        });
    };
    return Project;
}());
exports.Project = Project;
