import { Elipsoide, RadiosCurvatura, readLines } from '../';
import * as nj from 'numjs';
const RadiosCurvaturaGRS80 = new RadiosCurvatura('GRS80');

export async function ParseGNSS(sesionNumber : number) : Promise<(number | Date)[][]>{
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
            , vN = latDiff*(ro + hProm)
            , aN = latDiff
            , vE = lonDiff*(nhu + hProm)*Math.cos(latProm)
            , aE = lonDiff*Math.cos(latProm)
            , vD = -hDiff
            , aD = hDiff;
        return [date, ...actual.slice(8, 11), vN, vE, vD, aN, aE, aD]
    });
    
}

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
        console.log(getInertialAccNFrame(roll, pitch, yaw, ax, ay, az));
        console.log(getInertialAccNFrameRotated(roll, pitch, yaw, ax, ay, az));
        return [actualAcc[0], ax, ay, az, roll, pitch, yaw];
    });

}

export function mergeInertialGNSS(sesionNumber : number){

}

export function getInertialAccNFrameRotated(roll : number, pitch : number, yaw : number, accx : number, accy : number, accz : number){
    let rotMatrix = nj.array([ [1, 0, 0], [0, -1, 0], [0, 0, -1] ]);
    let accNFrame = getInertialAccNFrame(roll, pitch, yaw, accx, accy, accz);
    return rotMatrix.dot(accNFrame);
}

export function getInertialAccNFrame(roll : number, pitch : number, yaw : number, accx : number, accy : number, accz : number){
    let rotMatrix = getRotationMatrix(roll, pitch, yaw);
    let accVector = nj.array([accx, accy, accz]);
    return rotMatrix.dot(accVector);
}

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