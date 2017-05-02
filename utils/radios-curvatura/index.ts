import { Elipsoide } from '../elipsoides';

/**
 * @class RadiosCurvatura : Clase para calcular los radios de curvatura 
 *                          en un elipsoide determinado
 * @param elipsoideName   : Nombre del elipsoide
 */
export class RadiosCurvatura {

    private elipsoide : Elipsoide;
    
    /**
     * @constructor
     */
    constructor(elipsoideName : string){
        this.elipsoide = new Elipsoide(elipsoideName);
    }

    /**
     * @method getRadioPrimerVertical
     * @summary Método que cálcula el valor del radio del primer vertical del elipsoide.
     * @param latitude : Latitud del punto de cálculo en Radianes.
     * @return Valor del radio del primer vetical en metros (nhu).
     */
    getRadioPrimerVertical(latitude : number){
        let elip = this.elipsoide;
        let numerador = elip.getSemiejeMayor();
        let denominador = Math.sqrt( 1 - ( ( elip.getPrimeraExcentricidad()**2 )*( Math.sin(latitude)**2 ) ) );
        return numerador/denominador;
    }

    /**
     * @method getRadioElipseMeridiana
     * @summary Método que cálcula el valor del radio de la elipse meridiana.
     * @param latitude : Latitud del punto de cálculo en Radianes.
     * @return Valor del radio de la elipse meridiana en metros (ro).
     */
    getRadioElipseMeridiana(latitude : number){
        let elip = this.elipsoide;
        let numerador = elip.getSemiejeMayor()*( 1 - ( elip.getPrimeraExcentricidad()**2 ) )
        let denominador = Math.pow( 1 - ( ( elip.getPrimeraExcentricidad()**2 ) * ( Math.sin(latitude)**2 ) ), 1.5 );
        return numerador/denominador;
    }
}