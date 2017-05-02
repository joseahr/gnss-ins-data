import elipsoides =  require('./elipsoides.json');

/**
 * @interface IElipsoide
 * @summary   Contiene los parámetros que puede almacenar 
 *            un elipsoide dentro del fichero JSON de elipsoides.
 */
declare interface IElipsoide {
    a  : number, // Semieje menor
    b  : number, // Semieje mayor
    f  : number, // Aplanamiento
    GM : number, // Constante Grav
    We : number, // Velocidad Angular
    J2 : number  // Factor de forma dinámico
}

/**
 * @class   Elipsoide
 * @summary Recibe como parámetro el nombre del elipsoide y da acceso a métodos 
 *          útiles para obtener parámetros del elipsoide.
 * @param   nombre : El nombre del elipsoide (Ver archivo elipsoides.json para ver disponibilidad)
 */
export class Elipsoide {
    nombre : string;
    private properties : IElipsoide; // Todas las propiedades

    constructor(nombre : string){
        if(!elipsoides[nombre]){
            throw `El elipsoide ${nombre} no está disponible`;
        }
        this.nombre = nombre;
        this.properties = elipsoides[nombre];
    }

    /**
     * @static getElipsoidesDisponibles : Muestra los elipsoides disponibles
     */
    static getElipsoidesDisponibles() : string[] {
        return Object.keys(elipsoides);
    }
    
    /**
     * @method getProperties : Devuelve las propiedades del elipsoide
     */
    getProperties(){
        return this.properties;
    }

    /**
     * @method getSemiejeMayor : Devuelve el semieje mayor (a) en metros del elipsoide
     */
    getSemiejeMayor(){
        return this.properties.a;
    }

    /**
     * @method getSemiejeMenor : Devuelve el semieje menor (b) en metros del elipsoide
     */
    getSemiejeMenor(){
        let { a, b, f } = this.properties;
        if(!f) return b;
        return a - ( a*( 1/f ) );
    }

    /**
     * @method getAplanamiento : Devuelve el aplanamiento del elipsoide
     */
    getAplanamiento(){
        let { a, b, f } = this.properties;
        if(f) return f;
        return 1/((a-b)/(a))
    }

    /**
     * @method getExcentricidadLineal : Devuelve la excentricidad lineal del elipsoide
     */
    getExcentricidadLineal(){
        let { a } = this.properties;
        return Math.sqrt( (a**2) - (this.getSemiejeMenor()*this.getSemiejeMenor()) )
    }

    /**
     * @method getPrimeraExcentricidad : Devuelve la primera excentricidad del elipsoide
     */
    getPrimeraExcentricidad(){
        let { a } = this.properties;
        return this.getExcentricidadLineal()/a;
    }

    /**
     * @method getSegundaExcentricidad : Devuelve la segunda excentricidad del elipsoide
     */
    getSegundaExcentricidad(){
        return this.getExcentricidadLineal()/this.getSemiejeMenor();
    }

    /**
     * @method getVelocidadAngular : Devuelve la velocidad angular
     */
    getVelocidadAngular(){
        let { We } = this.properties;
        return We;
    }

    /**
     * @method getFactorFormaDinamico : Devuelve el factor de forma dinámico J2
     */
    getFactorFormaDinamico(){
        let { J2 } = this.properties;
        return J2;
    }

    /**
     * @method getGM : Devuelve la constante de gravitación GM
     */
    getGM(){
        let { GM } = this.properties;
        return GM;
    }

}

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