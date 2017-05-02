import { Elipsoide, RadiosCurvatura, readLines, somigliana } from '../';
import * as nj from 'numjs';
import * as fs from 'fs';

const RadiosCurvaturaGRS80 = new RadiosCurvatura('GRS80');
const GRS80                = new Elipsoide('GRS80');
const { We }               = GRS80.getProperties();
const TIME_DIFF            = 0.005;
/**
 * 
 * @param sesionNumber 
 */
export async function ParseGNSS(sesionNumber : number){
    let fileGNSS = (await readLines('../GNSSdata_ses1.txt')).map( 
        line => 
            line
            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g) 
            .map(Number)
    );
    
    return fileGNSS.map( (actual, index, array)=>{
        let anterior = array[index - 1];
        let [ day, month, year, hour, minute, second ] = actual.slice(1, 7);
        //console.log(day, month, year, hour, minute, second);
        let date = new Date(year, month - 1, day, hour, minute, second);
        //console.log(date.toLocaleString())
        if(!anterior){
            // Devolvemos fecha, lat, lon, h, vN, vE, vD, aN, aE, aD
            return [date, ...actual.slice(8, 11), 0, 0, 0, 0, 0, 0]
        }
        //console.log(anterior, actual);
        let [ latAct, lonAct, hAct ] = actual.slice(8, 11);
        let [ latAnt, lonAnt, hAnt ] = anterior.slice(8, 11);
        //console.log(latAct, lonAct, hAct);
        let   latProm = (latAct + latAnt)/2
            , latDiff = (latAct - latAnt)
            , lonProm = (lonAct + lonAnt)/2
            , lonDiff = (lonAct - lonAnt)
            , hProm   = (hAct + hAnt)/2
            , hDiff   = (hAct - hAnt)
            , [ ro, nhu ] = [
                  RadiosCurvaturaGRS80.getRadioElipseMeridiana(latProm)
                , RadiosCurvaturaGRS80.getRadioPrimerVertical(latProm) 
              ]
            , vN_ = latDiff*(ro + hProm)
            , aN_ = latDiff
            , vE_ = lonDiff*(nhu + hProm)*Math.cos(latProm)
            , aE_ = lonDiff*Math.cos(latProm)
            , vD_ = -hDiff
            , aD_ = hDiff
            ;
        
        return [date, ...actual.slice(8, 11), vN_, vE_, vD_, aN_, aE_, aD_]
    });
    
}

/**
 * 
 * @param sesionNumber 
 */
export async function ParseInertial(sesionNumber : number){
    let fileInertialAcc = (await readLines('../MT_calib_ses1.txt')).map( 
        line => 
            line
            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g) 
            .map(Number)
    );
    let fileInertialEuler = (await readLines('../MT_euler_ses1.txt')).map( 
        line => 
            line
            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g) 
            .map(Number)
    );
    //console.log(fileInertialAcc.length, fileInertialEuler.length);
    if(fileInertialAcc.length !== fileInertialEuler.length){
        throw `Los archivos MT_euler y MT_calib deben tener el mismo número de líneas`;
    }
    
    return fileInertialAcc.map( (actualAcc, index, array)=>{
        let anteriorAcc   = array[index - 1];
        let siguienteAcc  = array[index + 1];
        let [ax, ay, az]  = actualAcc.slice(1, 4);

        let anteriorEuler  = fileInertialEuler[index - 1];
        let actualEuler    = fileInertialEuler[index];
        let siguienteEuler = fileInertialEuler[index + 1];

        let [roll, pitch, yaw] = actualEuler
            .slice(1, 4)
            .map( ang => ang*Math.PI/180);

        // Rellenamos los valores de aceleración faltantes
        // Debido a huecos en el archivo
        if([ax, ay, az].some( el => el === 0)){
            ax = (anteriorAcc[1] + siguienteAcc[1])/2;
            ay = (anteriorAcc[2] + siguienteAcc[2])/2;
            az = (anteriorAcc[3] + siguienteAcc[3])/2;
        }

        // Rellenamos los valores faltante de ángulos de euler
        if([roll, pitch, yaw].some( el => el === 0)){
            roll  = ((anteriorEuler[1] + siguienteEuler[1])/2)*Math.PI/180;
            pitch = ((anteriorEuler[2] + siguienteEuler[2])/2)*Math.PI/180;
            yaw   = ((anteriorEuler[3] + siguienteEuler[3])/2)*Math.PI/180;
        }
        //console.log(ax, ay, az, roll, pitch, yaw);
        //console.log(getRotationMatrix(roll, pitch, yaw));
        //console.log(getInertialAccNFrame(roll, pitch, yaw, ax, ay, az));
        //console.log(getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az).tolist());
        [ ax, ay, az ] = getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az).tolist();
        return [actualAcc[0], roll, pitch, yaw, ax, ay, az];
    });

}

/**
 * @name mergeInertialGNSS
 * @param sesionNumber : número de sesión
 * @param delay : Tiempo de desplazamiento entre los datos GNSS e Inercial
 */
export async function mergeInertialGNSS(sesionNumber : number, delay : number){
    let gnss     = await ParseGNSS(sesionNumber);
    let inertial = await ParseInertial(sesionNumber);
    let data = [];
    console.log(delay, Math.floor(gnss.length - (inertial.length/200)));
    let minDelay = Math.ceil(gnss.length - (inertial.length/200));
        delay    = Math.max(delay, minDelay);
    //console.log(gnss.length, inertial.length);
    let [ vN, vE, vD ] = [ 0, 0, 0 ];

    for(let i = delay; i < gnss.length; i++){
        let [ date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_ ] : any[] = gnss[i]
            , gn = somigliana(latGNSS, hGNSS)
        ;
        //console.log(gn);
        for(let j = 200*(i - delay); j < 200*(i - delay) + 200; j++){
            //console.log(j, inertial[j]);
            let [ time, roll, pitch, yaw, ax, ay, az ] = inertial[j]
                , aN = ax + gn[0] -2*We*vE_*Math.sin(latGNSS) + aN_*vD_ - aE_*vE_*Math.sin(latGNSS)
                , aE = ay + gn[1] -2*We*vN_*Math.sin(latGNSS) + 2*We*vD_*Math.cos(latGNSS) + aE_*vN_*Math.sin(latGNSS) + aE_*vD_*Math.cos(latGNSS)
                , aD = az + gn[2] -2*We*vE_*Math.cos(latGNSS) - aE_*vN_*Math.cos(latGNSS) - aN_*vN_
            ;
            //console.log(aN, aE, aD);
            [ vN, vE, vD ] = [
                  vN + aN*TIME_DIFF
                , vE + aE*TIME_DIFF
                , vD + aD*TIME_DIFF
            ];
            // Obtenemos la posición a partir de las velocidades
            let   ro      = RadiosCurvaturaGRS80.getRadioElipseMeridiana(latGNSS)
                , nhu     = RadiosCurvaturaGRS80.getRadioPrimerVertical(latGNSS)
                , latIner = latGNSS + ( (vN*TIME_DIFF)/(ro + hGNSS) )
                , lonIner = lonGNSS + ( (vE*TIME_DIFF)/(nhu + hGNSS) * Math.cos(latGNSS) )
                , hIner   = hGNSS + vD*TIME_DIFF
            ;
            //console.log(latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS);
            data.push([latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS].join(','));   
        }
    }
    fs.writeFile('result', data.join('\n'), ()=>{});
}

/**
 * @name getInertialAccNFrameRotated
 * @param roll 
 * @param pitch 
 * @param yaw 
 * @param accx 
 * @param accy 
 * @param accz 
 */
export function getInertialAccNFrameRotated(roll : number, pitch : number, yaw : number, accx : number, accy : number, accz : number){
    let rotMatrix = nj.array([ [1, 0, 0], [0, -1, 0], [0, 0, -1] ]);
    let accNFrame = getInertialAccNFrame(roll, pitch, yaw, accx, accy, accz);
    return rotMatrix.dot(accNFrame);
}

/**
 * 
 * @param roll 
 * @param pitch 
 * @param yaw 
 * @param accx 
 * @param accy 
 * @param accz 
 */
export function getInertialAccNFrame(roll : number, pitch : number, yaw : number, accx : number, accy : number, accz : number){
    let rotMatrix = getRotationMatrix(roll, pitch, yaw);
    let accVector = nj.array([accx, accy, accz]);
    return rotMatrix.dot(accVector);
}

/**
 * 
 * @param roll 
 * @param pitch 
 * @param yaw 
 */
export function getRotationMatrix(roll : number, pitch : number, yaw : number){
    let   c11 = Math.cos(pitch)*Math.cos(yaw)
        , c12 = Math.sin(roll)*Math.sin(pitch)*Math.cos(yaw)-Math.cos(roll)*Math.sin(yaw)
        , c13 = Math.cos(roll)*Math.sin(pitch)*Math.cos(yaw)+Math.sin(roll)*Math.sin(yaw)
        
        , c21 = Math.cos(pitch)*Math.sin(yaw)
        , c22 = Math.sin(roll)*Math.sin(pitch)*Math.sin(yaw)+Math.cos(roll)*Math.cos(yaw)
        , c23 = Math.cos(roll)*Math.sin(pitch)*Math.sin(yaw)-Math.sin(roll)*Math.cos(yaw)

        , c31 = -(Math.sin(pitch))
        , c32 = Math.sin(roll)*Math.cos(pitch)
        , c33 = Math.cos(roll)*Math.cos(pitch);

    return nj.array([[c11, c12, c13], [c21, c22, c23], [c31, c32, c33]]);
    
}