#!/usr/bin/env node
'use strict';
import { ParseGNSS, ParseInertial, mergeInertialGNSS, getSessionsMetadata, Project, MetodoAjusteISNGNSS } from './utils';
import { exec } from 'child_process';
import * as meow from 'meow';
import * as clc from 'cli-color';

const errorLog = clc.red.bold;
const warnLog = clc.yellow;
const noticeLog = clc.blue;

const cli = meow(`
	Usage
	  $ gnss-ins-calc <path/to/project/data> [-- <session-delay> [args]] [-- <photo-delays> [args]] [-- <method> [libre|ligado]]
	Options
	  --session-delay  A list of delays for each session (Used to match the GNSS and INS data together)
	  --ext   A list of delays for each session (Used to match the pictures with the merged data (GNSS + INS))
	Example
	  $ gnss-ins-calc . --session-delay 10,20,30,40 --photo-delay 10,20,30,40
`);

cli.flags.app = cli.input.slice(1);
const projectDir = cli.input[0];

let p = new Project(projectDir);

let delaysGNSSINS = (cli.flags.sessionDelays ? cli.flags.sessionDelays.split(',') : []).map(Number); //[35, 55, 35, 20];
let delaysHoraGNSSFotosReloj = ( cli.flags.photoDelays ? cli.flags.photoDelays.split(',') : [] ).map(Number); //[25, 30, null, -30];
let method = cli.flags.method; //MetodoAjusteISNGNSS.Ligado;

console.log(delaysGNSSINS, delaysHoraGNSSFotosReloj, method);
if(!delaysGNSSINS || !delaysGNSSINS.length){
    console.error(
        errorLog(`Error : Session delays must be provided. Make sure you set the flag --session-delays with the delays for each session.`)
    );
    process.exit(1);
}

if(!delaysHoraGNSSFotosReloj || !delaysHoraGNSSFotosReloj.length){
    console.error(
        errorLog(`Error : Photo delays must be provided. Make sure you set the flag --photo-delays with the delays for each session.`)
    )
    process.exit(1);
}

let methods = ['free', 'bound'];

if(method && methods.indexOf(method) == -1){
    console.error(
        errorLog(`Error : "method" is not a required flag, but if set, it should be one of the following values : [free|bound]`)
    );
    process.exit(1);  
}

method = ( method == 'free' ? MetodoAjusteISNGNSS.Libre : MetodoAjusteISNGNSS.Ligado ); // Por defecto será un ajuste ligado

//console.log(method);
p.buildAllSessions(method, delaysGNSSINS, delaysHoraGNSSFotosReloj)
.then(()=> p.sessions)
.then((sessionInfo : any) =>{ 
    console.log(noticeLog('Mostrando gráficas'))
    exec(
          `python ${__dirname}/plot.py ${projectDir} ${sessionInfo.length} ${method == 0 ? 'libre' : 'ligado'}`
        , (err, stdout, stderr) => console.log(err, stdout, stderr)
    );
});