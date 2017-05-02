import { ParseGNSS, ParseInertial, mergeInertialGNSS } from './utils';

//ParseGNSS(1)
//.then( acc => console.log(acc));

//ParseInertial(1).then(console.log.bind(console));

mergeInertialGNSS(1, 30);