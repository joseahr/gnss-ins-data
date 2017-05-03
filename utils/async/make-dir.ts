import * as fs from 'fs';
import * as path from 'path';

export function makeDir(path_ : string, dirName : string){
    return new Promise((resolve, reject)=>{
        fs.mkdir(path.join(path_, dirName), (err)=> resolve())
    });
}