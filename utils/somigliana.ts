import { Elipsoide } from '.';
const G_POLO = 9.7803267715
    , G_ECUA = 9.8321863685
    , GRS80  = new Elipsoide('GRS80');

export function somigliana(latitude : number, helip : number){
    let [ a, b, We, J2, GM ] = [
                                      GRS80.getSemiejeMayor()
                                    , GRS80.getSemiejeMenor()
                                    , GRS80.getVelocidadAngular()
                                    , GRS80.getFactorFormaDinamico()
                                    , GRS80.getGM()
                               ];
    let numerador = a*G_POLO*Math.cos(latitude)**2 + b*G_ECUA*Math.sin(latitude)**2;
    let divisor   = a**2 * Math.cos(latitude)**2 + b**2 * Math.sin(latitude)**2;
    let somi = numerador / divisor;

    let m = (We**2 * a**2 * b)/GM;
    let f = 3/2*J2 + m/2 + 9/8*J2**2 + 15/28*J2*m + 3/56*m**2;
    let somiFull = somi * (1 - 2/a*(1+f+m+2*f*Math.sin(latitude)**2)*helip + 3/a**2*helip**2);
    let somiNorth = -8.08e-6 * helip/1000*Math.sin(2*latitude);
    let somiDown = -somiFull;
    return [somiNorth, 0, somiDown]
}