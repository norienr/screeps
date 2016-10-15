var defenseModule = require('defenseModule');
var unitControlModule = require('unitControlModule');
var constructionModule = require('constructionModule');

var main = function () {

    for (let i in Game.rooms) {
        const roomName = Game.rooms[i].name;

        unitControlModule.run(roomName);
        constructionModule.run(roomName);
        defenseModule.run(roomName);
    }

};

module.exports.loop = main;
