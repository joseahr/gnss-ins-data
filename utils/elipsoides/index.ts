import elipsoides =  require('./elipsoides.json');

declare interface IElipsoide {
    a  : number, // Semieje menor
    b  : number, // Semieje mayor
    f  : number, // Aplanamiento
    GM : number, // Constante Grav
    We : number, // Velocidad Angular
    J2 : number  // Factor de forma dinámico
}

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

    static getElipsoidesDisponibles() : IElipsoide {
        return elipsoides;
    }

    getProperties(){
        return this.properties;
    }

    getSemiejeMayor(){
        return this.properties.a;
    }

    getSemiejeMenor(){
        let { a, b, f } = this.properties;
        if(!f) return b;
        return a - ( a*( 1/f ) );
    }

    getAplanamiento(){
        let { a, b, f } = this.properties;
        if(f) return f;
        return 1/((a-b)/(a))
    }

    getExcentricidadLineal(){
        let { a } = this.properties;
        return Math.sqrt( (a**2) - (this.getSemiejeMenor()*this.getSemiejeMenor()) )
    }

    getPrimeraExcentricidad(){
        let { a } = this.properties;
        return this.getExcentricidadLineal()/a;
    }

    getSegundaExcentricidad(){
        return this.getExcentricidadLineal()/this.getSemiejeMenor();
    }

    getVelocidadAngular(){
        let { We } = this.properties;
        return We;
    }

    getFactorFormaDinamico(){
        let { J2 } = this.properties;
        return J2;
    }

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