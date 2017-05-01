import * as readline from 'readline';
import * as fs from 'fs';

export async function readLines(path : string){
    return await readLinesPromise(path);
}

function readLinesPromise(path : string) : Promise<string[]>{
    const lines : string[] = [];
    const lineReader = readline.createInterface({
        input : fs.createReadStream(path)
    });
    lineReader.on('line', (line)=> lines.push(line));
    return new Promise( (resolve, reject)=>{
        lineReader.on('close', ()=> resolve(lines));
    });
}