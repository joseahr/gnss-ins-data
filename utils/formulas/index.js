"use strict";
var path = require("path");
var nj = require("numjs");
var _1 = require("../");
var GRS80 = new _1.Elipsoide('GRS80');
var RadiosCurvaturaGRS80 = new _1.RadiosCurvatura('GRS80');
var We = GRS80.getProperties().We;
function getDifferentials(lastPosition, actualPosition, nextPosition) {
    var latAct = actualPosition[0], lonAct = actualPosition[1], hAct = actualPosition[2], latAnt = lastPosition[0], lonAnt = lastPosition[1], hAnt = lastPosition[2], latSig = nextPosition[0], lonSig = nextPosition[1], hSig = nextPosition[2], latDiff = (latAct - latAnt) / 1 // Entre 1 ya que es diferencial entre tiempo (1 segundo)
    , latDiff_ = (latSig - latAct) / 1, lonDiff = (lonAct - lonAnt) / 1, lonDiff_ = (lonSig - lonAct) / 1, hDiff = (hAct - hAnt) / 1, hDiff_ = (hSig - hAct) / 1;
    return [latDiff, latDiff_, lonDiff, lonDiff_, hDiff, hDiff_];
}
exports.getDifferentials = getDifferentials;
function getAcceleration(lastPosition, actualPosition, nextPosition) {
    var latAct = actualPosition[0], lonAct = actualPosition[1], hAct = actualPosition[2], latAnt = lastPosition[0], lonAnt = lastPosition[1], hAnt = lastPosition[2], latSig = nextPosition[0], lonSig = nextPosition[1], hSig = nextPosition[2], _a = getDifferentials(lastPosition, actualPosition, nextPosition), latDiff = _a[0], latDiff_ = _a[1], lonDiff = _a[2], lonDiff_ = _a[3], hDiff = _a[4], hDiff_ = _a[5], _b = [
        RadiosCurvaturaGRS80.getRadioElipseMeridiana(latAct),
        RadiosCurvaturaGRS80.getRadioPrimerVertical(latAct)
    ], ro = _b[0], nhu = _b[1], aN_ = (latSig - 2 * latAct + latAnt) * (ro + hAct), aE_ = (lonSig - 2 * lonAct + lonAnt) * (nhu + hAct) * Math.cos(latAct), aD_ = hSig - 2 * hAct + hAnt;
    return [aN_, aE_, aD_];
}
exports.getAcceleration = getAcceleration;
function getVelocity(lastPosition, actualPosition, nextPosition) {
    var latAct = actualPosition[0], lonAct = actualPosition[1], hAct = actualPosition[2], latAnt = lastPosition[0], lonAnt = lastPosition[1], hAnt = lastPosition[2], latSig = nextPosition[0], lonSig = nextPosition[1], hSig = nextPosition[2], _a = getDifferentials(lastPosition, actualPosition, nextPosition), latDiff = _a[0], latDiff_ = _a[1], lonDiff = _a[2], lonDiff_ = _a[3], hDiff = _a[4], hDiff_ = _a[5], _b = [
        RadiosCurvaturaGRS80.getRadioElipseMeridiana(latAct),
        RadiosCurvaturaGRS80.getRadioPrimerVertical(latAct)
    ], ro = _b[0], nhu = _b[1], vN_ = (latDiff * (ro + hAct) + latDiff_ * (ro + hAct)) / 2, vE_ = (lonDiff * (nhu + hAct) * Math.cos(latAct) + lonDiff_ * (nhu + hAct) * Math.cos(latAct)) / 2, vD_ = (hDiff + hDiff_) / 2;
    return [vN_, vE_, vD_];
}
exports.getVelocity = getVelocity;
function getNextPosition(initialPosition, velocities, TIME_DIFF) {
    var latIner = initialPosition[0], lonIner = initialPosition[1], hIner = initialPosition[2], vN = velocities[0], vE = velocities[1], vD = velocities[2], _a = [
        RadiosCurvaturaGRS80.getRadioElipseMeridiana(latIner),
        RadiosCurvaturaGRS80.getRadioPrimerVertical(latIner)
    ], ro = _a[0], nhu = _a[1];
    var latIner_ = latIner + ((vN * TIME_DIFF) / (ro + hIner));
    var lonIner_ = lonIner + ((vE * TIME_DIFF) / (nhu + hIner) * Math.cos(latIner));
    var hIner_ = hIner + vD * TIME_DIFF;
    return [latIner_, lonIner_, hIner_];
}
exports.getNextPosition = getNextPosition;
function getNextVelocity(initialVelocity, acceleration, TIME_DIFF) {
    var vN = initialVelocity[0], vE = initialVelocity[1], vD = initialVelocity[2], aN = acceleration[0], aE = acceleration[1], aD = acceleration[2];
    _a = [vN + aN * TIME_DIFF, vE + aE * TIME_DIFF, vD + aD * TIME_DIFF], vN = _a[0], vE = _a[1], vD = _a[2];
    return [vN, vE, vD];
    var _a;
}
exports.getNextVelocity = getNextVelocity;
function getFreeInertialAcc(latitudeGNSS, hElipGNSS, inertialAcc, velocityGNSS, accGNSS) {
    var gn = _1.somigliana(latitudeGNSS, hElipGNSS), ax = inertialAcc[0], ay = inertialAcc[1], az = inertialAcc[2], vN_ = velocityGNSS[0], vE_ = velocityGNSS[1], vD_ = velocityGNSS[2], aN_ = accGNSS[0], aE_ = accGNSS[1], aD_ = accGNSS[2], aN = ax + gn[0] - 2 * We * vE_ * Math.sin(latitudeGNSS) + aN_ * vD_ - aE_ * vE_ * Math.sin(latitudeGNSS), aE = ay + gn[1] - 2 * We * vN_ * Math.sin(latitudeGNSS) + 2 * We * vD_ * Math.cos(latitudeGNSS)
        + aE_ * vN_ * Math.sin(latitudeGNSS) + aE_ * vD_ * Math.cos(latitudeGNSS), aD = az - gn[2] - 2 * We * vE_ * Math.cos(latitudeGNSS) - aE_ * vN_ * Math.cos(latitudeGNSS) - aN_ * vN_;
    return [aN, aE, aD];
}
exports.getFreeInertialAcc = getFreeInertialAcc;
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
function getGNNSFilePath(projectPath, sessionNumber) {
    return path.join(projectPath, 'GNSS', "GNSSdata_ses" + sessionNumber + ".txt");
}
exports.getGNNSFilePath = getGNNSFilePath;
function getINSAccFilePath(projectPath, sessionNumber) {
    return path.join(projectPath, 'INS', "ses" + sessionNumber, "MT_calib_ses" + sessionNumber + ".txt");
}
exports.getINSAccFilePath = getINSAccFilePath;
function getINSEulerFilePath(projectPath, sessionNumber) {
    return path.join(projectPath, 'INS', "ses" + sessionNumber, "MT_euler_ses" + sessionNumber + ".txt");
}
exports.getINSEulerFilePath = getINSEulerFilePath;
