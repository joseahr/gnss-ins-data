"use strict";
var elipsoides_1 = require("../elipsoides");
var RadiosCurvatura = (function () {
    function RadiosCurvatura(elipsoideName) {
        this.elipsoide = new elipsoides_1.Elipsoide(elipsoideName);
    }
    /*
        @brief: Método que cálcula el valor del radio del primer vertical del elipsoide.
        @param Latitud number: Latitud del punto de cálculo en Radianes.
        @return float: Valor del radio del primer vetical en metros (nhu).
    */
    RadiosCurvatura.prototype.getRadioPrimerVertical = function (latitude) {
        var elip = this.elipsoide;
        var numerador = elip.getSemiejeMayor();
        var denominador = Math.sqrt(1 - ((Math.pow(elip.getPrimeraExcentricidad(), 2)) * (Math.pow(Math.sin(latitude), 2))));
        return numerador / denominador;
    };
    /*
        @brief: Método que cálcula el valor del radio de la elipse meridiana.
        @param Latitud number: Latitud del punto de cálculo en Radianes.
        @return: float: Valor del radio de la elipse meridiana en metros (ro).
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
