var defenseModule = require('defenseModule');
var unitControlModule = require('unitControlModule');

var main = function () {
    defenseModule.run();
    unitControlModule.run();
};

module.exports.loop = main;
