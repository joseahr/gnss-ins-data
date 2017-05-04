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
var path = require("path");
var _1 = require("../");
var REGEX_SESSION = /session\ +\d+/g;
var REGEX_PHOTO = /(photo\ +\d+)|(\d+:\d+:\d+)|(IMG_\d+)/g;
var REGEX_START_PROJECT = /(starting\ +->\ +)|(point\ +\d+)|(\d+:\d+:\d+)/g;
var REGEX_END_PROJECT = /(ending\ +->\ +)|(point\ +\d+)|(\d+:\d+:\d+)/g;
var REGEX_GNSS_FILE = /(GNSS file:)|(\w+?\.\w+)/g;
var REGEX_INS_FILE = /(INS file\ +:)|(\w+?\.\w+)/g;
var _a = [2, 2, 2017], day = _a[0], month = _a[1], year = _a[2]; // mes - 1
function getProjectMetadataFilePath(projectPath) {
    return path.join(projectPath, 'sessions.txt');
}
exports.getProjectMetadataFilePath = getProjectMetadataFilePath;
function getSessionsMetadata(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, sessionInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = getProjectMetadataFilePath(projectPath);
                    return [4 /*yield*/, _1.readLines(filePath)];
                case 1:
                    sessionInfo = (_a.sent())
                        .reduce(function (array, line, index) {
                        //console.log(line);
                        if (line.match(REGEX_SESSION)) {
                            var sessionID = line.match(REGEX_SESSION).join(''), obj_1 = {};
                            return (obj_1['name'] = sessionID, array.push(obj_1), array);
                        }
                        var obj = array[array.length - 1];
                        if ((line.match(REGEX_PHOTO) || []).length === 3) {
                            var _a = line.match(REGEX_PHOTO), photoID = _a[0], date_ = _a[1], imgName = _a[2];
                            //console.log(photoID, date_, imgName)
                            var _b = date_.split(':'), hh = _b[0], mm = _b[1], ss = _b[2], date = new Date();
                            date.setFullYear(year, month, day);
                            date.setHours(+hh);
                            date.setMinutes(+mm);
                            date.setSeconds(+ss);
                            date.setMilliseconds(0);
                            if (!obj['photos']) {
                                obj['photos'] = [];
                            }
                            return (obj['photos'].push({ photoID: photoID, date: date, imgName: imgName }), array);
                        }
                        if ((line.match(REGEX_START_PROJECT) || []).length === 3) {
                            var _c = line.match(REGEX_START_PROJECT), point = _c[1], date_ = _c[2];
                            //console.log(date_, point);
                            var _d = date_.split(':'), hh = _d[0], mm = _d[1], ss = _d[2], date = new Date();
                            date.setFullYear(year, month, day);
                            date.setHours(+hh);
                            date.setMinutes(+mm);
                            date.setSeconds(+ss);
                            date.setMilliseconds(0);
                            //console.log(date_, date);
                            return (obj['start'] = { point: point, date: date }, array);
                        }
                        if ((line.match(REGEX_END_PROJECT) || []).length === 3) {
                            var _e = line.match(REGEX_END_PROJECT), point = _e[1], date_ = _e[2];
                            //console.log(date_);
                            var _f = date_.split(':'), hh = _f[0], mm = _f[1], ss = _f[2], date = new Date();
                            date.setFullYear(year, month, day);
                            date.setHours(+hh);
                            date.setMinutes(+mm);
                            date.setSeconds(+ss);
                            date.setMilliseconds(0);
                            return (obj['end'] = { point: point, date: date }, array);
                        }
                        if ((line.match(REGEX_GNSS_FILE) || []).length == 2) {
                            if (!obj['files'])
                                obj['files'] = {};
                            if (!obj['files']['gnss'])
                                obj['files']['gnss'] = [];
                            var _g = line.match(REGEX_GNSS_FILE), fileName = _g[1];
                            //console.log(fileName)
                            return (obj['files']['gnss'].push(fileName), array);
                        }
                        if ((line.match(REGEX_INS_FILE) || []).length == 2) {
                            if (!obj['files'])
                                obj['files'] = {};
                            if (!obj['files']['ins'])
                                obj['files']['ins'] = [];
                            var _h = line.match(REGEX_INS_FILE), fileName = _h[1];
                            return (obj['files']['ins'].push(fileName), array);
                        }
                        return array;
                    }, []);
                    //console.log(sessionInfo);
                    //fs.writeFile('sessionInfo', JSON.stringify(sessionInfo, null, "\t"), ()=>{})
                    return [2 /*return*/, sessionInfo];
            }
        });
    });
}
exports.getSessionsMetadata = getSessionsMetadata;
