const defenseModule = require('defenseModule');
const unitControlModule = require('unitControlModule');
const squadControlModule = require('squadControlModule');
const prototypesInitializer = require('prototypesInitializer');

const main = function () {

    for (let roomName in Game.rooms) {
        prototypesInitializer.init(roomName);
        unitControlModule.run(roomName);
        defenseModule.run(roomName);
    }

    squadControlModule.run();
};

module.exports.loop = main;
