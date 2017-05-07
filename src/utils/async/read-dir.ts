import * as fs from 'fs';

export function readDir(path : string){
    return new Promise( (resolve, reject)=>{
        fs.readdir(path, (error, files)=>{
            if(error) return reject(error);
            resolve(files);
        })
    });
}