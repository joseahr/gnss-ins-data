"use strict";
var utils_1 = require("./utils");
//ParseGNSS(1)
//.then( acc => console.log(acc));
utils_1.ParseInertial(1).then(console.log.bind(console));
