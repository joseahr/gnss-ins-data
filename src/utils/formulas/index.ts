import * as path from 'path';
import * as nj from 'numjs';
import { 
      RadiosCurvatura
    , Elipsoide
    , somigliana 
} from '../';

const GRS80                = new Elipsoide('GRS80');
const RadiosCurvaturaGRS80 = new RadiosCurvatura('GRS80');
const { We } = GRS80.getProperties();


export function getDifferentials(lastPosition : number[], actualPosition : number[], nextPosition : number[]){
        let   [ latAct, lonAct, hAct ] = actualPosition
            , [ latAnt, lonAnt, hAnt ] = lastPosition
            , [ latSig, lonSig, hSig ] = nextPosition
            , latDiff                  = (latAct - latAnt) / 1 // Entre 1 ya que es diferencial entre tiempo (1 segundo)
            , latDiff_                 = (latSig - latAct) / 1
            , lonDiff                  = (lonAct - lonAnt) / 1
            , lonDiff_                 = (lonSig - lonAct) / 1
            , hDiff                    = (hAct - hAnt) / 1
            , hDiff_                   = (hSig - hAct) / 1
        return [ latDiff, latDiff_, lonDiff, lonDiff_, hDiff, hDiff_ ];
}

export function getAcceleration(lastPosition : number[], actualPosition : number[], nextPosition : number[]){
    let   [ latAct, lonAct, hAct ]                                = actualPosition
        , [ latAnt, lonAnt, hAnt ]                                = lastPosition
        , [ latSig, lonSig, hSig ]                                = nextPosition
        , [ latDiff, latDiff_, lonDiff, lonDiff_, hDiff, hDiff_ ] = getDifferentials(lastPosition, actualPosition, nextPosition)
        , [ ro, nhu ]                                             = [
                                                                        RadiosCurvaturaGRS80.getRadioElipseMeridiana(latAct)
                                                                      , RadiosCurvaturaGRS80.getRadioPrimerVertical(latAct) 
                                                                    ]
        , aN_                                                     = (latSig - 2*latAct + latAnt) * (ro + hAct)
        , aE_                                                     = (lonSig - 2*lonAct + lonAnt) * (nhu + hAct)*Math.cos(latAct)
        , aD_                                                     = hSig - 2*hAct + hAnt
    ;
    return [aN_, aE_, aD_];
}


export function getVelocity(lastPosition : number[], actualPosition : number[], nextPosition : number[]){
    let   [ latAct, lonAct, hAct ]                                = actualPosition
        , [ latAnt, lonAnt, hAnt ]                                = lastPosition
        , [ latSig, lonSig, hSig ]                                = nextPosition
        , [ latDiff, latDiff_, lonDiff, lonDiff_, hDiff, hDiff_ ] = getDifferentials(lastPosition, actualPosition, nextPosition)
        , [ ro, nhu ]                                             = [
                                                                          RadiosCurvaturaGRS80.getRadioElipseMeridiana(latAct)
                                                                        , RadiosCurvaturaGRS80.getRadioPrimerVertical(latAct) 
                                                                    ]
        , vN_ = (latDiff*(ro + hAct) + latDiff_*(ro + hAct)) / 2
        , vE_ = (lonDiff*(nhu + hAct)*Math.cos(latAct) + lonDiff_*(nhu + hAct)*Math.cos(latAct)) / 2
        , vD_ = (hDiff + hDiff_) / 2
    ;
    return [vN_, vE_, vD_];
}

export function getNextPosition(initialPosition : number[],  velocities : number[], TIME_DIFF : number){
        let   [ latIner, lonIner, hIner ] = initialPosition
            , [ vN, vE, vD ]                 = velocities
            , [ ro, nhu ]                    = [
                                                  RadiosCurvaturaGRS80.getRadioElipseMeridiana(latIner)
                                                , RadiosCurvaturaGRS80.getRadioPrimerVertical(latIner) 
                                               ]
        let latIner_ = latIner + ( (vN*TIME_DIFF)/(ro + hIner) );
        let lonIner_ = lonIner + ( (vE*TIME_DIFF)/(nhu + hIner) * Math.cos(latIner) );
        let hIner_   = hIner + vD*TIME_DIFF;
        return [latIner_, lonIner_, hIner_];
}

export function getNextVelocity(initialVelocity : number[], acceleration : number[], TIME_DIFF : number){
    let   [ vN, vE, vD ] = initialVelocity
        , [ aN, aE, aD ] = acceleration
    ;
    [ vN, vE, vD ] = [ vN + aN*TIME_DIFF, vE + aE*TIME_DIFF, vD + aD*TIME_DIFF ]
    return [ vN, vE, vD ];
}

export function getFreeInertialAcc(latitudeGNSS : number, hElipGNSS : number, inertialAcc : number[], velocityGNSS : number[], accGNSS : number[]){
    let   gn = somigliana(latitudeGNSS, hElipGNSS)
        , [ ax, ay, az ] = inertialAcc
        , [ vN_, vE_, vD_ ] = velocityGNSS
        , [ aN_, aE_, aD_ ] = accGNSS
        , aN = ax + gn[0] -2*We*vE_*Math.sin(latitudeGNSS) + aN_*vD_ - aE_*vE_*Math.sin(latitudeGNSS)
        , aE = ay + gn[1] -2*We*vN_*Math.sin(latitudeGNSS) + 2*We*vD_*Math.cos(latitudeGNSS) 
                  + aE_*vN_*Math.sin(latitudeGNSS) + aE_*vD_*Math.cos(latitudeGNSS)
        , aD = az - gn[2] -2*We*vE_*Math.cos(latitudeGNSS) - aE_*vN_*Math.cos(latitudeGNSS) - aN_*vN_
    return [ aN, aE, aD ];
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


export function getGNNSFilePath(projectPath : string, sessionNumber : number){
    return path.join(projectPath, 'GNSS', `GNSSdata_ses${sessionNumber}.txt`);
}

export function getINSAccFilePath(projectPath : string, sessionNumber : number){
    return path.join(projectPath, 'INS', `ses${sessionNumber}`,`MT_calib_ses${sessionNumber}.txt`);
}

export function getINSEulerFilePath(projectPath : string, sessionNumber : number){
    return path.join(projectPath, 'INS', `ses${sessionNumber}`,`MT_euler_ses${sessionNumber}.txt`);
}