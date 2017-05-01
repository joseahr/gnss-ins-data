"use strict";
var elipsoides = require("./elipsoides.json");
var Elipsoide = (function () {
    function Elipsoide(nombre) {
        if (!elipsoides[nombre]) {
            throw "El elipsoide " + nombre + " no est\u00E1 disponible";
        }
        this.nombre = nombre;
        this.properties = elipsoides[nombre];
    }
    Elipsoide.getElipsoidesDisponibles = function () {
        return elipsoides;
    };
    Elipsoide.prototype.getProperties = function () {
        return this.properties;
    };
    Elipsoide.prototype.getSemiejeMayor = function () {
        return this.properties.a;
    };
    Elipsoide.prototype.getSemiejeMenor = function () {
        var _a = this.properties, a = _a.a, b = _a.b, f = _a.f;
        if (!f)
            return b;
        return a - (a * (1 / f));
    };
    Elipsoide.prototype.getAplanamiento = function () {
        var _a = this.properties, a = _a.a, b = _a.b, f = _a.f;
        if (f)
            return f;
        return 1 / ((a - b) / (a));
    };
    Elipsoide.prototype.getExcentricidadLineal = function () {
        var a = this.properties.a;
        return Math.sqrt((Math.pow(a, 2)) - (this.getSemiejeMenor() * this.getSemiejeMenor()));
    };
    Elipsoide.prototype.getPrimeraExcentricidad = function () {
        var a = this.properties.a;
        return this.getExcentricidadLineal() / a;
    };
    Elipsoide.prototype.getSegundaExcentricidad = function () {
        return this.getExcentricidadLineal() / this.getSemiejeMenor();
    };
    Elipsoide.prototype.getVelocidadAngular = function () {
        var We = this.properties.We;
        return We;
    };
    Elipsoide.prototype.getFactorFormaDinamico = function () {
        var J2 = this.properties.J2;
        return J2;
    };
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
