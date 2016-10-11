var defenseModule = require('defenseModule');
var spawnModule = require('spawnModule');
var unitControlModule = require('unitControlModule');

var main = function () {
    spawnModule.run();
    defenseModule.run();
    unitControlModule.run();
};

module.exports.loop = main;
