import { readDir, getSessionsMetadata, mergeInertialGNSS } from '../';
import * as path from 'path';
import * as fs from 'fs';

export class Project {

    sessions : Promise<any>;

    constructor(private path_ : string){
        this.sessions = getSessionsMetadata(path_)
            //.then( metadata => this.sessions = metadata)
            //.then( ()=> console.log(this.sessions))
    }

    buildSession(sessionNumber : number, delay : number){
        mergeInertialGNSS(this.path_, sessionNumber, delay)
            .then( (data)=> fs.writeFile(path.join(this.path_, `ses${sessionNumber}`), data.map((el : any) => el.join(',')).join('\n'), ()=>{}) );
    }

    buildAllSessions(...delays : number[]){
        this.sessions
            .then( (sessionsInfo)=>{
                sessionsInfo.forEach( (element : any, index : number) => {
                    this.buildSession(index + 1, delays[index])
                });
            })
    }

}