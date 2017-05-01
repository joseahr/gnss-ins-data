import { Elipsoide } from '../elipsoides';

export class RadiosCurvatura {

    private elipsoide : Elipsoide;

    constructor(elipsoideName : string){
        this.elipsoide = new Elipsoide(elipsoideName);
    }

    /*
        @brief: Método que cálcula el valor del radio del primer vertical del elipsoide.
        @param Latitud number: Latitud del punto de cálculo en Radianes.
        @return float: Valor del radio del primer vetical en metros (nhu).
    */
    getRadioPrimerVertical(latitude : number){
        let elip = this.elipsoide;
        let numerador = elip.getSemiejeMayor();
        let denominador = Math.sqrt( 1 - ( ( elip.getPrimeraExcentricidad()**2 )*( Math.sin(latitude)**2 ) ) );
        return numerador/denominador;
    }

    /*
        @brief: Método que cálcula el valor del radio de la elipse meridiana.
        @param Latitud number: Latitud del punto de cálculo en Radianes.
        @return: float: Valor del radio de la elipse meridiana en metros (ro).
    */
    getRadioElipseMeridiana(latitude : number){
        let elip = this.elipsoide;
        let numerador = elip.getSemiejeMayor()*( 1 - ( elip.getPrimeraExcentricidad()**2 ) )
        let denominador = Math.pow( 1 - ( ( elip.getPrimeraExcentricidad()**2 ) * ( Math.sin(latitude)**2 ) ), 1.5 );
        return numerador/denominador;
    }
}