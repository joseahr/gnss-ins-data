import { ParseGNSS, ParseInertial, mergeInertialGNSS, getSessionsMetadata, Project, MetodoAjusteISNGNSS } from './utils';
import { exec } from 'child_process';
let projectDir = 'C:\\Users\\Jose\\Desktop\\Practice\\Data';
let p = new Project(projectDir);
/**
p.buildSession(1, 35);
p.buildSession(2, 55);
p.buildSession(3, 35);
p.buildSession(4, 70);
*/

let method = MetodoAjusteISNGNSS.Ligado;
console.log(method);
p.buildAllSessions(method, 35, 55, 35, 70)
.then(()=> p.sessions)
.then((sessionInfo : any) =>{ 
    console.log('Mostrando gráficas', sessionInfo.length)
    exec(`python plot.py ${projectDir} ${sessionInfo.length} ${ method == 0 ? 'libre' : 'ligado' }`, (err, stdout, stderr) => console.log(err, stdout, stderr))
});