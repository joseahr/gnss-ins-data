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
 } from '../';

const TIME_DIFF            = 0.005;

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
        let   anteriorAcc    = array[index - 1]
            , siguienteAcc   = array[index + 1]
            , [ax, ay, az]   = actualAcc.slice(1, 4)
            , anteriorEuler  = fileInertialEuler[index - 1]
            , actualEuler    = fileInertialEuler[index]
            , siguienteEuler = fileInertialEuler[index + 1];

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
    ;
    //let minDelay = Math.ceil(gnss.length - (inertial.length/200));
        //delay    = Math.min(delay, minDelay);
    for(let i = 0; i < gnss.length; i++){

        let   cont = -1
            , [ date, latGNSS, lonGNSS, hGNSS, vN_, vE_, vD_, aN_, aE_, aD_ ] : any[] = gnss[i]
        ;
        if(metodo == 1 || i == 0){
            [latIner, lonIner, hIner] = [latGNSS, lonGNSS, hGNSS];
            [vN, vE, vD] = [vN_, vE_, vD_];
        }
        //console.log(gnss[i])
        for(let j = 200*(-delay + i); j < 200*(-delay + i) + 200; j++){
            //console.log(j, i);
            //console.log(inertial[j])
            cont++;
            if(!inertial[j]) break;
            let [ time, roll, pitch, yaw, ax, ay, az ] = inertial[j]
                , [ aN, aE, aD ]                       = getFreeInertialAcc(latGNSS, hGNSS, [ax, ay, az], [vN_, vE_, vD_], [aN_, aE_, aD_])
                , dateInertial                         = new Date(date.getTime() + cont * 0.05)
            ;
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
            data.push([dateInertial, latIner*180/Math.PI, lonIner*180/Math.PI, hIner, latGNSS*180/Math.PI, lonGNSS*180/Math.PI, hGNSS, aN, aE, aD, aN_, aE_, aD_]);   
        }
    }
    //console.log(data[0], data[0].length, typeof data[0])
    //fs.writeFile('result', data.map((el : any) => el.join(',')).join('\n'), ()=>{});
    return data;
}

export function checkPhoto(){}