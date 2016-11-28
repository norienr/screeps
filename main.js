const defenseModule = require('defenseModule');
const unitControlModule = require('unitControlModule');
const squadControlModule = require('squadControlModule');
const constructionModule = require('constructionModule')
const prototypesInitializer = require('prototypesInitializer');

const main = function () {

    for (let roomName in Game.rooms) {
        prototypesInitializer.init(roomName);
        unitControlModule.run(roomName);
        defenseModule.run(roomName);
        constructionModule.run(roomName);
    }

    squadControlModule.run();
};

module.exports.loop = main;
