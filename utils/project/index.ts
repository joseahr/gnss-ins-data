import { readDir, makeDir, getSessionsMetadata, mergeInertialGNSS, MetodoAjusteISNGNSS } from '../';
import * as path from 'path';
import * as fs from 'fs';

export class Project {

    sessions : Promise<any>;

    constructor(private path_ : string){
        this.sessions = getSessionsMetadata(path_)
            //.then( metadata => this.sessions = metadata)
            //.then( ()=> console.log(this.sessions))
    }

    async buildSession(sessionNumber : number, delay : number, method : MetodoAjusteISNGNSS){
        let dataMerged = await mergeInertialGNSS(this.path_, sessionNumber, delay, method);
        console.log(`Datos para la sesión ${sessionNumber} calculados correctamente`);
        fs.writeFile(
              path.join(this.path_, 'results', `${ method == 0 ? 'libre' : 'ligado' }`, `ses${sessionNumber}`)
            , dataMerged.map((el : any) => el.join(',')).join('\n')
            , ()=>{}
        );
        return;
    }

    async buildAllSessions(method : MetodoAjusteISNGNSS, ...delays : number[]){
        let sessionsInfo = await this.sessions;
        let resultDir    = await makeDir(this.path_, 'results');
        let resultMethodDir    = await makeDir(path.join(this.path_, 'results'), method == 0 ? 'libre' : 'ligado');
        return Promise.all(sessionsInfo.map( async (element : any, index : number) => {
            console.log(`Calculando datos para la sesión ${index + 1}`);
            await this.buildSession(index + 1, delays[index], method);
        }));
    }

}