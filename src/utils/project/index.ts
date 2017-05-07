import { readDir, readLines, makeDir, getSessionsMetadata, mergeInertialGNSS, MetodoAjusteISNGNSS, getPhotoDetail, getStops } from '../';
import * as path from 'path';
import * as fs from 'fs';
import * as open from 'opn';
import * as clc from 'cli-color';

const errorLog = clc.red.bold;
const warnLog = clc.yellow;
const noticeLog = clc.blue;

const mapHtmlPath = path.join(__dirname, '../../index.html');

export class Project {

    sessions : Promise<any>;
    mapHtml : Promise<string> = ( async()=> readLines(mapHtmlPath).then( lines => lines.join('\n') ) )();

    constructor(private path_ : string){
        this.sessions = getSessionsMetadata(path_)
            //.then( metadata => this.sessions = metadata)
            //.then( ()=> console.log(this.sessions))
    }

    async buildSession(sessionNumber : number, delay : number, method : MetodoAjusteISNGNSS, photoDelay : number){
        let dataMerged = await mergeInertialGNSS(this.path_, sessionNumber, delay, method);
        let sessionPath = path.join(this.path_, 'results', `${ method == 0 ? 'libre' : 'ligado' }`, `ses${sessionNumber}`);

        fs.writeFile( sessionPath, dataMerged.map((el : any) => el.join(',')).join('\n'), ()=>{} );

        console.log(noticeLog(`Datos para la sesión ${sessionNumber} calculados correctamente`));

        let photoDetail = await getPhotoDetail(this.path_, sessionNumber, dataMerged, photoDelay, 100);
        if(!photoDetail || !photoDetail.length){
            //console.log('no phtos')
            let stops = await getStops(this.path_, sessionNumber, dataMerged, 125);
            let mapStr = await this.buildDataForMap(sessionNumber, dataMerged, stops);

            let stopsPath = path.join(this.path_, 'results', `${ method == 0 ? 'libre' : 'ligado' }`, `photos_ses${sessionNumber}.json`);
            fs.writeFile( stopsPath, JSON.stringify(stops, null, '\t'), ()=>{} );

            let mapPath = path.join(this.path_, 'results', `${ method == 0 ? 'libre' : 'ligado' }`, `ses${sessionNumber}.html`);
            fs.writeFile( mapPath, mapStr, ()=>{ open(mapPath, {app: 'firefox'}) } );
            return;
        }

        let mapStr = await this.buildDataForMap(sessionNumber, dataMerged, photoDetail);

        let photosPath = path.join(this.path_, 'results', `${ method == 0 ? 'libre' : 'ligado' }`, `photos_ses${sessionNumber}.json`);
        fs.writeFile( photosPath, JSON.stringify(photoDetail, null, '\t'), ()=>{} );

        let mapPath = path.join(this.path_, 'results', `${ method == 0 ? 'libre' : 'ligado' }`, `ses${sessionNumber}.html`);
        fs.writeFile( mapPath, mapStr, ()=>{ open(mapPath, {app: 'firefox'}) } );
    }

    async buildAllSessions(method : MetodoAjusteISNGNSS, delays : number[], photoDelays : number[]){
        let sessionsInfo = await this.sessions;
        let resultDir    = await makeDir(this.path_, 'results');
        let resultMethodDir    = await makeDir(path.join(this.path_, 'results'), method == 0 ? 'libre' : 'ligado');
        return await Promise.all(sessionsInfo.map( async (element : any, index : number) => {
            console.log(noticeLog(`Calculando datos para la sesión ${index + 1}`));
            await this.buildSession(index + 1, delays[index], method, photoDelays[index]);
        }));
    }
    
    async buildDataForMap(sessionNumber : number, dataMerged : any[], photosOrStops : any[]){
        let htmlstr = (' ' + await this.mapHtml).slice(1);
        let dataStrGPS = `${JSON.stringify( dataMerged.filter( (e, idx) => idx % 200 == 0 ).map( e => e.slice(1, 3).reverse() ), null, '\t' )}`;
        let dataStrIner = `${JSON.stringify( dataMerged.map( e => e.slice(1, 3).reverse() ), null, '\t' )}`;
        let dataStopsPhotos = `${JSON.stringify( photosOrStops.map( e => e.coordinates.geo.slice(0, 2).map( (c : any) => c*180/Math.PI ).reverse() ), null, '\t' )}`;
        return htmlstr
            .replace('{{dataGPS}}', dataStrGPS)
            .replace('{{dataIner}}', dataStrIner)
            .replace('{{photosOrStops}}', dataStopsPhotos)
            .replace('{{title}}', `Sesión ${sessionNumber}`);
    }

}