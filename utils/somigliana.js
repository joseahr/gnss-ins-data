"use strict";
var _1 = require(".");
var G_POLO = 9.7803267715 // Gravedad media en el polo
, G_ECUA = 9.8321863685 // Gravedad media en el ecuador
, GRS80 = new _1.Elipsoide('GRS80');
/**
 * @function       : somigliana
 * @summary        : Función para calcular la gravedad normal según la fórmula de somigliana
 * @param latitude : Latitud (en radianes) del punto de cálculo
 * @param helip    : Altura elipsoidal (en m) del punto de cálculo
 */
function somigliana(latitude, helip) {
    var _a = [
        GRS80.getSemiejeMayor(),
        GRS80.getSemiejeMenor(),
        GRS80.getVelocidadAngular(),
        GRS80.getFactorFormaDinamico(),
        GRS80.getGM()
    ], a = _a[0], b = _a[1], We = _a[2], J2 = _a[3], GM = _a[4];
    var numerador = a * G_POLO * Math.pow(Math.cos(latitude), 2) + b * G_ECUA * Math.pow(Math.sin(latitude), 2);
    var divisor = Math.pow(a, 2) * Math.pow(Math.cos(latitude), 2) + Math.pow(b, 2) * Math.pow(Math.sin(latitude), 2);
    var somi = numerador / divisor;
    var m = (Math.pow(We, 2) * Math.pow(a, 2) * b) / GM;
    var f = 3 / 2 * J2 + m / 2 + 9 / 8 * Math.pow(J2, 2) + 15 / 28 * J2 * m + 3 / 56 * Math.pow(m, 2);
    var somiFull = somi * (1 - 2 / a * (1 + f + m + 2 * f * Math.pow(Math.sin(latitude), 2)) * helip + 3 / Math.pow(a, 2) * Math.pow(helip, 2));
    var somiNorth = -8.08e-6 * helip / 1000 * Math.sin(2 * latitude);
    var somiDown = -somiFull;
    return [somiNorth, 0, somiDown];
}
exports.somigliana = somigliana;
