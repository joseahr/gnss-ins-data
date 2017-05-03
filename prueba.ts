import { ParseGNSS, ParseInertial, mergeInertialGNSS, getSessionsMetadata, Project } from './utils';

//ParseGNSS(1)
//.then( acc => console.log(acc));

//ParseInertial(1).then(console.log.bind(console));

//mergeInertialGNSS(1, 35);

//getSessionsMetadata('')

let p = new Project('C:\\Users\\Jose\\Desktop\\Practice\\Data');
/**
p.buildSession(1, 35);
p.buildSession(2, 55);
p.buildSession(3, 35);
p.buildSession(4, 70);
*/
p.buildAllSessions(35, 55, 35, 70);