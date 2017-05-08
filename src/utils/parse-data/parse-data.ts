import {
      getGNNSFilePath
    , readLines
    , getVelocity
    , getAcceleration
    , getINSAccFilePath
    , getINSEulerFilePath
    , getInertialAccNFrameRotated
    , getFreeInertialAcc
    , getNextVelocity
    , getNextPosition
    , getSessionsMetadata
    , getRotationMatrix
    , GeoToUTM
 } from '../';

const TIME_DIFF = 0.005;

const nj = require('numjs');
import * as mathjs from 'mathjs';
import * as clc from 'cli-color';

const errorLog = clc.red.bold;
const warnLog = clc.yellow;
const noticeLog = clc.blue;

// const INSVector = [0, 0, 0]
const GPSVector = [0, 0, 0.2]; // En el iframe
const CamVector = [0.1940, 0.2540, 0.035]; // En el iframe
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
    //console.log('fileGNSS', fileGNSS.length);
    return fileGNSS.map( (actual, index, array)=>{
        let anterior  = array[index - 1] ? array[index - 1] : array[index];
        let siguiente = array[index + 1] ? array[index + 1] : array[index];

        let [ day, month, year, hour, minute, second ] = actual.slice(1, 7);
        let date = new Date(year, month - 1, day, hour, minute, second);

        let   [ lastPosition, actualPosition, nextPosition ] = [anterior, actual, siguiente].map( array => array.slice(8, 11) )
            , [ vN_, vE_, vD_ ]                              = getVelocity(lastPosition, actualPosition, nextPosition)
            , [ aN_, aE_, aD_ ]                              = getAcceleration(lastPosition, actualPosition, nextPosition)
        ;
        return [date, ...actualPosition, vN_, vE_, vD_, aN_, aE_, aD_];
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
    //console.log('fileInertial', fileInertialAcc.length)
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
        let   anteriorAcc    = array[index - 1] ? array[index - 1] : actualAcc
            , siguienteAcc   = array[index + 1] ? array[index + 1] : actualAcc
            , [ax, ay, az]   = actualAcc.slice(1, 4)
            , actualEuler    = fileInertialEuler[index]
            , anteriorEuler  = fileInertialEuler[index - 1] ? fileInertialEuler[index - 1] : actualEuler
            , siguienteEuler = fileInertialEuler[index + 1] ? fileInertialEuler[index + 1] : actualEuler;

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


export const enum MetodoAjusteISNGNSS {
    Libre, Ligado
}

/**
 * @name mergeInertialGNSS
 * @param metodo : 0 libre 1 ligado . default : MetodoAjusteISNGNSS.Ligado
 * @param sesionNumber : número de sesión
 * @param delay : Tiempo de desplazamiento entre los datos GNSS e Inercial
 */
export async function mergeInertialGNSS(projectPath : string, sesionNumber : number, delay : number, metodo : MetodoAjusteISNGNSS = 1){
    let   gnss           = await ParseGNSS(projectPath, sesionNumber)
        , inertial       = await ParseInertial(projectPath, sesionNumber)
        , [ vN, vE, vD ] = [ 0, 0, 0 ]
        , data           = []
        , latIner, lonIner, hIner
        , [date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_] : any[] = []
        , cont
    ;
    //let minDelay = Math.ceil(gnss.length - (inertial.length/200));
        //delay    = Math.min(delay, minDelay);
    for(let i = 0; i < gnss.length; i++){

        [ date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_ ] = gnss[i];
        if(metodo == 1 || i == 0){
            [latIner, lonIner, hIner] = [latGNSS, lonGNSS, hGNSS];
            [vN, vE, vD] = [vN_, vE_, vD_];
        }
        //console.log(gnss[i])
        cont = -1;
        //console.log(date, cont)
        for(let j = 200*(-delay + i); j < 200*(-delay + i) + 200; j++){
            //console.log(j, i);
            //console.log(inertial[j])
            cont++;
            //console.log(cont)
            if(!inertial[j]) continue;
            let [ time, roll, pitch, yaw, ax, ay, az ] = inertial[j]
                , [ aN, aE, aD ]                       = getFreeInertialAcc(latGNSS, hGNSS, [ax, ay, az], [vN_, vE_, vD_], [aN_, aE_, aD_])
                , dateInertial                         = new Date()
            ;
            dateInertial.setTime(date.getTime() + (cont * TIME_DIFF * 1000));
            //console.log(dateInertial.getTime(), date, cont);
            //console.log(aN, aE, aD);
            [ vN, vE, vD ]              = getNextVelocity([ vN, vE, vD ], [ aN, aE, aD ], TIME_DIFF);
            //console.log(vN, vE, vD);
            // Obtenemos la posición a partir de las velocidades
            //console.log(latIner, lonIner, hIner);
            [ latIner, lonIner, hIner ] = getNextPosition(
                  [latIner, lonIner, hIner]
                , [ vN, vE, vD] , TIME_DIFF
            );
            //console.log(latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS);
            //console.log(dateInertial)
            // Obtener la hora para cada observación
            data.push([dateInertial.getTime(), latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS, aN, aE, aD, aN_, aE_, aD_, roll, pitch, yaw]);   
        }
    }
    //console.log(data[0], data[0].length, typeof data[0])
    //fs.writeFile('result', data.map((el : any) => el.join(',')).join('\n'), ()=>{});
    return data;
}

export async function getPhotoDetail(projectPath : string, sessionNumber : number, mergedData : any[], photoDelay : number, halfRange : number = 100){
    let sessionInfo = (await getSessionsMetadata(projectPath))[sessionNumber - 1];
    let photos      = sessionInfo.photos;
    if(!photos || !photos.length){
        console.log(warnLog(`La sesión ${sessionNumber} no tiene fotos. Skiping...`));
        return [];
    };
    //console.log(photoDelay, 'fff');

    photoDelay *= 200;
    photos.forEach(function(photo : any){ photo.updated = false });
    //console.log(photoDelay)
    mergedData.forEach( (data, index, array)=>{
        // Para cada línea recorremos las fotos y comprobamos la fecha
        //console.log(data[0]);
        let fecha = data[0];
        //if(index == 0) console.log(photos);
        photos.forEach(function(photo : any){
            //console.log(photo.imgName, index, fecha);
            if( !photo.updated && Math.abs(fecha - photo.date.getTime()) == 0 ){
                photo.updated = true;
                //console.log(index, sessionNumber, photo, fecha, photo.date.getTime(), photo.date.getMilliseconds());
                let halfRange_ = (index + photoDelay > halfRange) 
                    ? halfRange
                    : (array.length - 1 - index - photoDelay > halfRange)
                    ? halfRange
                    : (array.length - 1 - index - photoDelay)
                ;
                let latitude = 0, longitude = 0, helip = 0, roll = 0, pitch = 0, yaw = 0;
                for(let i = index + photoDelay - halfRange_; i < index + photoDelay + halfRange_; i++){
                    let [ dateInertial, latIner, lonIner, hIner, latGNSS, lonGNSS, hGNSS, aN, aE, aD, aN_, aE_, aD_, roll_, pitch_, yaw_ ] = array[i];
                    latitude  += latIner;
                    longitude += lonIner;
                    helip     += hIner;
                    roll      += roll_;
                    pitch     += pitch;
                    yaw       += yaw;
                }
                // Cordenadas en el eframe (GPS)
                [ latitude, longitude, helip, roll, pitch, yaw ] = [ latitude, longitude, helip, roll, pitch, yaw ].map( e => e/(2*halfRange_) );
                //console.log(latitude, longitude, helip, roll, pitch, yaw);
                // Calcular los vectores en el camera Frame
                let rotationMtx = getRotationMatrix(roll, pitch, yaw);
                // Obtener coordenads UTM ya que los vectores est´n en metros
                let [X, Y, h, ..._] : any[] = GeoToUTM([latitude*Math.PI/180, longitude*Math.PI/180, helip], 'GRS80');
                //console.log(_);
                let [ GPSVecx, GPSVecy, GPSVecz ] = rotationMtx.dot(nj.array(GPSVector)).tolist();
                let [ CamVecx, CamVecy, CamVecz ] = rotationMtx.dot(nj.array(CamVector)).tolist();
                let [ XINS, YINS, hINS ] = [ X - GPSVecx, Y - GPSVecy, h - GPSVecz ];
                let [ XCam, YCam, hCam ] = [ XINS + CamVecx, YINS + CamVecy, hINS + CamVecz ];
                //console.log(index + halfRange_, index, halfRange_, mergedData.length)
                photo.date = new Date(mergedData[index + photoDelay][0]).toLocaleString();
                photo.coordinates = {
                      utm : [XCam, YCam, hCam].map( (num : number) => num.toFixed(3) )
                    , geo : [latitude*Math.PI/180, longitude*Math.PI/180, helip]
                };
                photo.numRow  = index + photoDelay;
                photo.attitude = [roll, pitch, yaw].map( (num : number) => num.toFixed(7) );
                //console.log(XCam, YCam, hCam, XINS, YINS, hINS, X, Y, h);
            }
        });
        //console.log('-------------------------------------')
    });
    return photos;
}

export async function getStops(projectPath : string, sessionNumber : number, mergedData : any[], halfRange : number = 200){
    let dataStops : any[] = [];
    //console.log(mergedData.length, 'abab');
    mergedData.forEach( (el, index, array)=>{
        if(index < halfRange) return;
        if(mergedData.length - index < halfRange) return;

        let y = mergedData
            .slice(index - halfRange, index)
            .map( e => Math.abs(e[7]) )
            //.filter( e => e >= 0 );
        let ymean = mathjs.mean(
            mergedData
            .slice(index, index + halfRange)
            .map( e => Math.abs(e[7]) )
        );
        
        if(ymean > 0.1) return;

        let Y = nj.array(y);

        let a = mergedData
            .slice(index - halfRange, index)
            .map( (e, i) => [ 1, index - halfRange + i, e ] )
            //.filter( e => e[2] >= 0 )
            .map( e => e.slice(0, 2) );
        let A = nj.array(a);

        try {
            var U = nj.array(mathjs.inv( A.T.dot(A).tolist() )).dot( A.T.dot(Y) ).tolist()
        } catch(e){
            return;
        }
        
        //console.log(Y)
        //console.log(A)
        let pendiente = U[1];
        let ordenadaAbs = U[0];
        let xcorte0 = ordenadaAbs/(-pendiente);

        //console.log(index, U[0]/(-U[1]));
        if(
            xcorte0 < index - (halfRange/4) || xcorte0 > index + (halfRange/4)
        ) return;
        //console.log('Parada : ' + index);
        let [latitude, longitude, helip] = el.slice(1, 4);
        dataStops.push({ numRow : Math.floor(xcorte0), coordinates : { geo : [latitude*Math.PI/180, longitude*Math.PI/180, helip] } })
    });
    return dataStops;
}