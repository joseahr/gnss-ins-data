"use strict";
var elipsoides_1 = require("../elipsoides");
/**
 * @class RadiosCurvatura : Clase para calcular los radios de curvatura
 *                          en un elipsoide determinado
 * @param elipsoideName   : Nombre del elipsoide
 */
var RadiosCurvatura = (function () {
    /**
     * @constructor
     */
    function RadiosCurvatura(elipsoideName) {
        this.elipsoide = new elipsoides_1.Elipsoide(elipsoideName);
    }
    /**
     * @method getRadioPrimerVertical
     * @summary Método que cálcula el valor del radio del primer vertical del elipsoide.
     * @param latitude : Latitud del punto de cálculo en Radianes.
     * @return Valor del radio del primer vetical en metros (nhu).
     */
    RadiosCurvatura.prototype.getRadioPrimerVertical = function (latitude) {
        var elip = this.elipsoide;
        var numerador = elip.getSemiejeMayor();
        var denominador = Math.sqrt(1 - ((Math.pow(elip.getPrimeraExcentricidad(), 2)) * (Math.pow(Math.sin(latitude), 2))));
        return numerador / denominador;
    };
    /**
     * @method getRadioElipseMeridiana
     * @summary Método que cálcula el valor del radio de la elipse meridiana.
     * @param latitude : Latitud del punto de cálculo en Radianes.
     * @return Valor del radio de la elipse meridiana en metros (ro).
     */
    RadiosCurvatura.prototype.getRadioElipseMeridiana = function (latitude) {
        var elip = this.elipsoide;
        var numerador = elip.getSemiejeMayor() * (1 - (Math.pow(elip.getPrimeraExcentricidad(), 2)));
        var denominador = Math.pow(1 - ((Math.pow(elip.getPrimeraExcentricidad(), 2)) * (Math.pow(Math.sin(latitude), 2))), 1.5);
        return numerador / denominador;
    };
    return RadiosCurvatura;
}());
exports.RadiosCurvatura = RadiosCurvatura;
