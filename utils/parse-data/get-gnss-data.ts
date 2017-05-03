import { Elipsoide, RadiosCurvatura, readLines, somigliana } from '../';
import * as nj from 'numjs';
import * as fs from 'fs';
import * as path from 'path';

const RadiosCurvaturaGRS80 = new RadiosCurvatura('GRS80');
const GRS80                = new Elipsoide('GRS80');
const { We }               = GRS80.getProperties();
const TIME_DIFF            = 0.005;
const REGEX_SESSION        = /session\ +\d+/g;
const REGEX_PHOTO          = /(photo\ +\d+)|(\d+:\d+:\d+)|(IMG_\d+)/g;
const REGEX_START_PROJECT  = /(starting\ +->\ +)|(point\ +\d+)|(\d+:\d+:\d+)/g;
const REGEX_END_PROJECT    = /(ending\ +->\ +)|(point\ +\d+)|(\d+:\d+:\d+)/g;
const REGEX_GNSS_FILE      = /(GNSS file:)|(\w+?\.\w+)/g;
const REGEX_INS_FILE       = /(INS file\ +:)|(\w+?\.\w+)/g;
/**
 * 
 * @param sesionNumber 
 */
export async function ParseGNSS(projectPath : string, sessionNumber : number){
    let filePath = getGNNSFilePath(projectPath, sessionNumber);
    let fileGNSS = (await readLines(filePath)).map( 
        line => 
            line
            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g) 
            .map(Number)
    );
    
    return fileGNSS.map( (actual, index, array)=>{
        let anterior  = array[index - 1] ? array[index - 1] : array[index];
        let siguiente = array[index + 1] ? array[index + 1] : array[index];
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
        let [ latSig, lonSig, hSig ] = anterior.slice(8, 11);
        //console.log(latAct, lonAct, hAct);
        let   latDiff  = (latAct - latAnt) / 1 // Entre 1 ya que es diferencial entre tiempo (1 segundo)
            , latDiff_ = (latSig - latAct) / 1
            , lonDiff  = (lonAct - lonAnt) / 1
            , lonDiff_ = (lonSig - lonAct) / 1
            , hDiff    = (hAct - hAnt) / 1
            , hDiff_   = (hSig - hAct) / 1
            , [ ro, nhu ] = [
                  RadiosCurvaturaGRS80.getRadioElipseMeridiana(latAct)
                , RadiosCurvaturaGRS80.getRadioPrimerVertical(latAct) 
              ]
            , vN_ = (latDiff*(ro + hAct) + latDiff_*(ro + hAct)) / 2
            , aN_ = (latSig - 2*latAct + latAnt) * (ro + hAct)
            , vE_ = (lonDiff*(nhu + hAct)*Math.cos(latAct) + lonDiff_*(nhu + hAct)*Math.cos(latAct)) / 2
            , aE_ = (lonSig - 2*lonAct + lonAnt) * (nhu + hAct)*Math.cos(latAct)
            , vD_ = (hDiff + hDiff_) / 2
            , aD_ = hSig - 2*hAct + hAnt
            ;
        return [date, ...actual.slice(8, 11), vN_, vE_, vD_, aN_, aE_, aD_]
    });
    
}

/**
 * 
 * @param sesionNumber 
 */
export async function ParseInertial(projectPath : string, sessionNumber : number){
    
    let fileAcc   = getINSAccFilePath(projectPath, sessionNumber);
    let fileEuler = getINSEulerFilePath(projectPath, sessionNumber);

    let fileInertialAcc = (await readLines(fileAcc)).map( 
        line => 
            line
            .match(/(\+|-)?(\d+\.\d+)|(\+|-)?(\d+)/g) 
            .map(Number)
    );
    let fileInertialEuler = (await readLines(fileEuler)).map( 
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
export async function mergeInertialGNSS(projectPath : string, sesionNumber : number, delay : number){
    let gnss     = await ParseGNSS(projectPath, sesionNumber);
    let inertial = await ParseInertial(projectPath, sesionNumber);
    let data = [];
    //console.log(delay, Math.ceil(gnss.length - (inertial.length/200)));
    let minDelay = Math.ceil(gnss.length - (inertial.length/200));
        delay    = Math.min(delay, minDelay);
    console.log(delay);
    console.log(gnss.length, inertial.length);
    let [ vN, vE, vD ] = [ 0, 0, 0 ];

    for(let i = 0; i < gnss.length; i++){
        let [ date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_ ] : any[] = gnss[i]
            , gn = somigliana(latGNSS, hGNSS)
        ;
        //console.log(gn);
        //console.log(i, j);
        let latIner, lonIner, hIner;
        let cont = -1;
        for(var j = 200*(-delay + i); j < 200*(-delay + i) + 200; j++){
            //console.log(j, i);
            //console.log(inertial[j])
            cont++;
            let dateInertial = new Date(date.getTime() + cont * 0.05);
            if(!inertial[j]) break;
            let [ time, roll, pitch, yaw, ax, ay, az ] = inertial[j]
                , aN = ax + gn[0] -2*We*vE_*Math.sin(latGNSS) + aN_*vD_ - aE_*vE_*Math.sin(latGNSS)
                , aE = ay + gn[1] -2*We*vN_*Math.sin(latGNSS) + 2*We*vD_*Math.cos(latGNSS) + aE_*vN_*Math.sin(latGNSS) + aE_*vD_*Math.cos(latGNSS)
                , aD = az - gn[2] -2*We*vE_*Math.cos(latGNSS) - aE_*vN_*Math.cos(latGNSS) - aN_*vN_
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
            ;
            latIner = (latIner ? latIner : latGNSS) + ( (vN*TIME_DIFF)/(ro + hGNSS) );
            lonIner = (lonIner ? lonIner : lonGNSS) + ( (vE*TIME_DIFF)/(nhu + hGNSS) * Math.cos(latGNSS) );
            hIner   = (hIner ? hIner : hGNSS) + vD*TIME_DIFF;
            //console.log(latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS);
            //console.log(dateInertial)
            // Obtener la hora para cada observación
            data.push([dateInertial, latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS, aN, aE, aD, aN_, aE_, aD_]);   
        }
    }
    //console.log(data[0], data[0].length, typeof data[0])
    //fs.writeFile('result', data.map((el : any) => el.join(',')).join('\n'), ()=>{});
    return data;
}

export function checkPhoto(){}


export async function getSessionsMetadata(projectPath : string){

    let filePath = getProjectMetadataFilePath(projectPath);

    let sessionInfo = 
        (await readLines(filePath))
        .reduce( (array : any, line, index)=>{
            //console.log(line);
            if( line.match(REGEX_SESSION) ){
                let   sessionID = line.match(REGEX_SESSION).join('')
                    , obj : any = {};
                return(obj['name'] = sessionID, array.push(obj), array);
            }

            let obj = array[array.length - 1];
            
            if( (line.match(REGEX_PHOTO) || []).length === 3 ){
                let [ photoID, date_, imgName ] = line.match(REGEX_PHOTO);
                //console.log(photoID, date_, imgName)
                let [hh, mm, ss] = date_.split(':'), 
                    date = new Date();
                    date.setHours(+hh);
                    date.setMinutes(+mm);
                    date.setSeconds(+ss);
                if(!obj['photos']){
                    obj['photos'] = [];
                }
                return (obj['photos'].push({ photoID, date, imgName }), array);
            }
            
            if( (line.match(REGEX_START_PROJECT) || []).length === 3 ){
                let [,point, date_] = line.match(REGEX_START_PROJECT);
                //console.log(date_, point);
                let [hh, mm, ss] = date_.split(':'), 
                    date = new Date();
                    date.setHours(+hh);
                    date.setMinutes(+mm);
                    date.setSeconds(+ss);                
                //console.log(date_, date);
                return (obj['start'] = { point, date }, array);
            }
            
            if( (line.match(REGEX_END_PROJECT) || []).length === 3 ){
                let [,point, date_] = line.match(REGEX_END_PROJECT);
                //console.log(date_);
                let [hh, mm, ss] = date_.split(':'), 
                    date = new Date();
                    date.setHours(+hh);
                    date.setMinutes(+mm);
                    date.setSeconds(+ss);
                return (obj['end'] = { point, date }, array); 
            }
            
            if( (line.match(REGEX_GNSS_FILE) || []).length == 2 ){
                if(!obj['files']) obj['files'] = {};
                if(!obj['files']['gnss']) obj['files']['gnss'] = [];
                let [ , fileName ] = line.match(REGEX_GNSS_FILE);
                //console.log(fileName)
                return (obj['files']['gnss'].push(fileName), array);
            }
            
            if( (line.match(REGEX_INS_FILE) || []).length == 2 ){
                if(!obj['files']) obj['files'] = {};
                if(!obj['files']['ins']) obj['files']['ins'] = [];
                let [ , fileName ] = line.match(REGEX_INS_FILE);
                return (obj['files']['ins'].push(fileName), array);
            }

            return array;
        }, [])
    //console.log(sessionInfo);
    //fs.writeFile('sessionInfo', JSON.stringify(sessionInfo, null, "\t"), ()=>{})

    return sessionInfo;
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

export function getProjectMetadataFilePath(projectPath : string){
    return path.join(projectPath, 'sessions.txt');
}

export function getGNNSFilePath(projectPath : string, sessionNumber : number){
    return path.join(projectPath, 'GNSS', `GNSSdata_ses${sessionNumber}.txt`);
}

export function getINSAccFilePath(projectPath : string, sessionNumber : number){
    return path.join(projectPath, 'INS', `ses${sessionNumber}`,`MT_calib_ses${sessionNumber}.txt`);
}

export function getINSEulerFilePath(projectPath : string, sessionNumber : number){
    return path.join(projectPath, 'INS', `ses${sessionNumber}`,`MT_euler_ses${sessionNumber}.txt`);
}