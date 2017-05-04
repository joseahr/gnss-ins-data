import { Elipsoide, RadiosCurvatura } from '../';

export function GeoToUTM(geoCoordinate : number[], elipsoideName : string, huso : number = null, w : Boolean = true, kp : Boolean = true){
    let elipsoide = new Elipsoide(elipsoideName);
    let radiosCurvatura = new RadiosCurvatura(elipsoideName);
    let [ lat, lon, h ] = geoCoordinate;

    //Calculo de parámetros del elipsoide.
    let nhu = radiosCurvatura.getRadioPrimerVertical(lat)
    , e = elipsoide.getPrimeraExcentricidad()
    , e2 = elipsoide.getSegundaExcentricidad()
    //Valores Auxiliares
    , t = Math.tan(lat)
    , t2 = (t**2)
    , t4 = (t**4)
    , t6 = (t**6)
    , t8 = (t**8)
    , n2 = ((e2**2))*((Math.cos(lat)**2))
    , n4 = (n2**2)
    , n6 = (n2**3)
    , n8 = (n2**4)
    , n10 = (n2**5)
    , n12 = (n2**6)
    , n14 = (n2**7)
    //Claculo de las series de terminos.
    //x cubo.
    , x3 = (1.0-t2+n2)
    //x quinta.
    , x5 = (5.0-18.0*t2+t4+14.0*n2-58.0*n2*t2+13.0*n4-64.0*n4*t2+4.0*n6-24.0*n6*t2)
    //x septima.
    , x7 = (61.0-479.0*t2+179.0*t4-t6+331.0*n2-3298.0*n2*t2+177.0*n2*t4+715.0*n4-8655.0*n4*t2+6080.0*n4*t4+769.0*n6-10964.0*n6*t2+9480.0*n6*t4+412.0*n8-5176.0*n8*t2+6912.0*n8*t4+88.0*n10-1632.0*n10*t2+1920.0*n10*t4)
    //x novena.
    , x9 = (1385.0-20480.0*t2+20690.0*t4-1636.0*t6+t8+12284.0*n2-173088.0*n2*t2+201468.0*n2*t4-54979.0*n2*t6-21.0*n2*t8+45318.0*n4-883449.0*n4*t2+14499197.0*n4*t4-390607.0*n4*t6-14.0*n4*t8+90804.0*n6-2195193.0*n6*t2+549800.0*n6*t4-1394064.0*n6*t6+104073.0*n8-2875680.0*n8*t2+7041648.0*n8*t4-2644992.0*n8*t6+68568.0*n10-2115840.0*n10*t2+5968512.0*n10*t4-2741760.0*n10*t6+25552.0*n12-880192.0*n12*t2+2811456.0*n12*t4-1474560.0*n12*t6+4672.0*n14-175680.0*n14*t2+603648.0*n14*t4-322560.0*n14*t6)
    //y cuarta.
    , y4 = (5.0-t2+9.0*n2+4.0*n4)
    //y sexta.
    , y6 = (61.0-58.0*t2+t4+270.0*n2-330.0*n2*t2+445.0*n4-680.0*n4*t2+324.0*n6-600.0*n6*t2+88.0*n8-192.0*n8*t2)
    //y octava.
    , y8 = (1385.0-3595.0*t2+543.0*t4-t6+10899.0*n2-18634.0*n2*t2+10787.0*n2*t4+7.0*n2*t6+34419.0*n4-120582.0*n4*t2+49644.0*n4*t4+56385.0*n6-252084.0*n6*t2+121800.0*n6*t4+47688.0*n8-242496.0*n8*t2+151872.0*n8*t4+20880.0*n10-121920.0*n10*t2+94080.0*n10*t4+4672.0*n12-30528.0*n12*t2+23040.0*n12*t4)
    
    //Calculo de lam.
    , s1 = Math.sin(lat)
    , s3 = (s1**3)
    , s5 = (s1**5)
    , s7 = (s1**7)
    , s9 = (s1**9)
    , c1 = Math.cos(lat)
    , g1 = lat
    , g2 = 1.5*(e**2)*((-0.5*s1*c1)+0.5*lat)
    , g3 = (15.0/8.0)*(e**4)*((-0.25*s3*c1)-((3.0/8.0)*s1*c1)+((3.0/8.0)*lat))
    , g4 = (35.0/16.0)*(e**6)*((-(1.0/6.0)*s5*c1)-((5.0/24.0)*s3*c1)-((5.0/16.0)*s1*c1)+((5.0/16.0)*lat))
    , g5 = (315/128)*(e**8)*((-(1/8)*s7*c1)-((7/48)*s5*c1)-((35/192)*s3*c1)-((35/128)*s1*c1)+((35/128)*lat))
    , g6 = (693/256)*(e**10)*((-(1/10)*s9*c1)-((9/80)*s7*c1)-((21/160)*s5*c1)-((21/128)*s3*c1)-((63/256)*s1*c1)+((63/256)*lat))
    , lam = elipsoide.getSemiejeMayor()*(1-(e**2))*(g1+g2+g3+g4+g5+g6)
    ;
    
    // Calculo del huso
    let lon0;
    if(!huso){
        huso = Math.floor(((180.0+lon*(180/Math.PI))/6)+1);
        lon0 = ((huso*6)-183)*Math.PI/180;
    } else {
        lon0 = ((huso*6)-183)*Math.PI/180;
        let lon0d = lon0 + 0.05817764173314432 //3º20'
        ,   lon0i = lon0 - 0.05817764173314432
        ;
        if(lon < lon0i || lon > lon0d){
            let message = `Solo se pueden forzar las coordenadas a los Husos adyacentes un máximo de 20', si estas se en cuentran en el extremo del Huso`;
            //console.log(message);
            throw message;
        }
    }

    //Incremento de longitud.
    let Alon = lon - lon0
    //Calculo de X.
    , c3=(c1**3)
    , c5=(c1**5)
    , c7=(c1**7)
    , c9=(c1**9)
    , X=500000.0+(0.9996*((Alon*nhu*c1)+(((Alon**3)/6.0)*nhu*c3*x3)+(((Alon**5)/120.0)*nhu*c5*x5)+(((Alon**7)/5040.0)*nhu*c7*x7)+(((Alon**9)/362880.0)*nhu*c9*x9)))
    //Calculo de Y.
    , c2=(Math.cos(lat)**2)
    , c4=(Math.cos(lat)**4)
    , c6=(Math.cos(lat)**6)
    , c8=(Math.cos(lat)**8)
    , Y=0.9996*(lam+(((Alon**2)/2.0)*nhu*t*c2)+(((Alon**4)/24.0)*nhu*t*c4*y4)+(((Alon**6)/720.0)*nhu*t*c6*y6)+(((Alon**8)/40320.0)*nhu*t*c8*y8))
    
    // Si la latiud está en el Hemisferio Sur:
    if(lat < 0)
        Y=10000000.0-Y
        
    //Cálculo de la convergencia de meridianos.
    //coeficientes.
    let convmed;
    if(w){
        let m3 = (1.0+3.0*n2+2*n4)
        ,   m5 = (2.0-t2+15.0*n2*t2+35.0*n4-50.0*n4*t2+33.0*n6-60.0*n6*t2+11.0*n8-24.0*n8*t2)
        ,   m7 = (-148.0-3427.0*t2+18.0*t4-1387.0*t6+2023.0*n2-46116.0*n2*t2+5166.0*n2*t4+18984.0*n4-100212.0*n4*t4+34783*n6-219968.0*n6*t2+144900.0*n6*t4+36180.0*n8-261508.0*n8*t2+155904.0*n8*t4+18472.0*n10-114528.0*n10*t2+94080.0*n10*t4+4672.0*n12-30528.0*n12*t2+23040.0*n12*t4)
        ;
        convmed = (Alon*s1)+(((Alon**3)/3.0)*s1*c2*m3)+(((Alon**5)/15.0)*s1*c4*m5)+(((Alon**7)/5040.0)*s1*c6*m7)
        convmed = convmed*180/Math.PI;
    }

    //Calculo de la escala local del punto.
    //coeficientes.
    let kp_ = 0;
    if(kp){
        let k2=(1+n2)
        , k4=(5.0-4.0*t2+14.0*n2-28.0*n2*t2+13.0*n4-48.0*n4*t2+4.0*n6-24.0*n6*t2)
        , k6=(61.0+10636.0*t2-9136.0*t4+224.0*t6+331.0*n2+44432.0*n2*t2-50058.0*n2*t4-715.0*n4+68100.0*n4*t2-95680.0*n4*t4+769.0*n6+43816.0*n6*t2-80160.0*n6*t4+412.0*n8+9644.0*n8*t2-21888.0*n8*t4+88.0*n10-1632.0*n10*t2+1920.0*n10*t4)
        ;
        kp_=(0.9996)*(1+(0.5*(Alon**2)*c2*k2)+(((Alon**4)/24.0)*c4*k4)+(((Alon**6)/720.0)*c6*k6))
    }
    
    let posY;
    if(lat > 0)
        posY ="N"
    else
        posY="S"
    
    return [X, Y, h, huso, posY, convmed, kp_]
}