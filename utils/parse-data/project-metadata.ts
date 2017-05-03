import * as path from 'path';
import { readLines } from '../';

const REGEX_SESSION        = /session\ +\d+/g;
const REGEX_PHOTO          = /(photo\ +\d+)|(\d+:\d+:\d+)|(IMG_\d+)/g;
const REGEX_START_PROJECT  = /(starting\ +->\ +)|(point\ +\d+)|(\d+:\d+:\d+)/g;
const REGEX_END_PROJECT    = /(ending\ +->\ +)|(point\ +\d+)|(\d+:\d+:\d+)/g;
const REGEX_GNSS_FILE      = /(GNSS file:)|(\w+?\.\w+)/g;
const REGEX_INS_FILE       = /(INS file\ +:)|(\w+?\.\w+)/g;

export function getProjectMetadataFilePath(projectPath : string){
    return path.join(projectPath, 'sessions.txt');
}

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