"use strict";
var elipsoides = require("./elipsoides.json");
/**
 * @class   Elipsoide
 * @summary Recibe como parámetro el nombre del elipsoide y da acceso a métodos
 *          útiles para obtener parámetros del elipsoide.
 * @param   nombre : El nombre del elipsoide (Ver archivo elipsoides.json para ver disponibilidad)
 */
var Elipsoide = (function () {
    function Elipsoide(nombre) {
        if (!elipsoides[nombre]) {
            throw "El elipsoide " + nombre + " no est\u00E1 disponible";
        }
        this.nombre = nombre;
        this.properties = elipsoides[nombre];
    }
    /**
     * @static getElipsoidesDisponibles : Muestra los elipsoides disponibles
     */
    Elipsoide.getElipsoidesDisponibles = function () {
        return Object.keys(elipsoides);
    };
    /**
     * @method getProperties : Devuelve las propiedades del elipsoide
     */
    Elipsoide.prototype.getProperties = function () {
        return this.properties;
    };
    /**
     * @method getSemiejeMayor : Devuelve el semieje mayor (a) en metros del elipsoide
     */
    Elipsoide.prototype.getSemiejeMayor = function () {
        return this.properties.a;
    };
    /**
     * @method getSemiejeMenor : Devuelve el semieje menor (b) en metros del elipsoide
     */
    Elipsoide.prototype.getSemiejeMenor = function () {
        var _a = this.properties, a = _a.a, b = _a.b, f = _a.f;
        if (!f)
            return b;
        return a - (a * (1 / f));
    };
    /**
     * @method getAplanamiento : Devuelve el aplanamiento del elipsoide
     */
    Elipsoide.prototype.getAplanamiento = function () {
        var _a = this.properties, a = _a.a, b = _a.b, f = _a.f;
        if (f)
            return f;
        return 1 / ((a - b) / (a));
    };
    /**
     * @method getExcentricidadLineal : Devuelve la excentricidad lineal del elipsoide
     */
    Elipsoide.prototype.getExcentricidadLineal = function () {
        var a = this.properties.a;
        return Math.sqrt((Math.pow(a, 2)) - (this.getSemiejeMenor() * this.getSemiejeMenor()));
    };
    /**
     * @method getPrimeraExcentricidad : Devuelve la primera excentricidad del elipsoide
     */
    Elipsoide.prototype.getPrimeraExcentricidad = function () {
        var a = this.properties.a;
        return this.getExcentricidadLineal() / a;
    };
    /**
     * @method getSegundaExcentricidad : Devuelve la segunda excentricidad del elipsoide
     */
    Elipsoide.prototype.getSegundaExcentricidad = function () {
        return this.getExcentricidadLineal() / this.getSemiejeMenor();
    };
    /**
     * @method getVelocidadAngular : Devuelve la velocidad angular
     */
    Elipsoide.prototype.getVelocidadAngular = function () {
        var We = this.properties.We;
        return We;
    };
    /**
     * @method getFactorFormaDinamico : Devuelve el factor de forma dinámico J2
     */
    Elipsoide.prototype.getFactorFormaDinamico = function () {
        var J2 = this.properties.J2;
        return J2;
    };
    /**
     * @method getGM : Devuelve la constante de gravitación GM
     */
    Elipsoide.prototype.getGM = function () {
        var GM = this.properties.GM;
        return GM;
    };
    return Elipsoide;
}());
exports.Elipsoide = Elipsoide;
/*
console.log(Elipsoide.getElipsoidesDisponibles())
let elip = new Elipsoide('GRS80')
console.log(elip.getSemiejeMayor())
console.log(elip.getSemiejeMenor())
console.log(elip.getAplanamiento())
console.log(elip.getVelocidadAngular())
console.log(elip.getExcentricidadLineal())
console.log(elip.getPrimeraExcentricidad())
console.log(elip.getSegundaExcentricidad())
console.log(elip.getVelocidadAngular())
console.log(elip.getFactorFormaDinamico())
*/ 
