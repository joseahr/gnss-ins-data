"use strict";
var _1 = require("../");
var path = require("path");
var fs = require("fs");
var Project = (function () {
    function Project(path_) {
        this.path_ = path_;
        this.sessions = _1.getSessionsMetadata(path_);
        //.then( metadata => this.sessions = metadata)
        //.then( ()=> console.log(this.sessions))
    }
    Project.prototype.buildSession = function (sessionNumber, delay) {
        var _this = this;
        _1.mergeInertialGNSS(this.path_, sessionNumber, delay)
            .then(function (data) { return fs.writeFile(path.join(_this.path_, "ses" + sessionNumber), data.map(function (el) { return el.join(','); }).join('\n'), function () { }); });
    };
    Project.prototype.buildAllSessions = function () {
        var _this = this;
        var delays = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            delays[_i - 0] = arguments[_i];
        }
        this.sessions
            .then(function (sessionsInfo) {
            sessionsInfo.forEach(function (element, index) {
                _this.buildSession(index + 1, delays[index]);
            });
        });
    };
    return Project;
}());
exports.Project = Project;
