import * as readline from 'readline';
import * as fs from 'fs';

/**
 * @function readLines
 * @summary  Devuelve una promesa que almacenará las líneas leídas del fichero
 * @param    path : Ruta hacia el fichero
 */
export function readLines(path : string) : Promise<string[]>{
    const lines : string[] = [];
    const lineReader = readline.createInterface({
        input : fs.createReadStream(path)
    });
    lineReader.on('line', (line)=> lines.push(line));
    return new Promise( (resolve, reject)=>{
        lineReader.on('close', ()=> resolve(lines));
    });
}