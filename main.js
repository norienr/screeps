var defenseModule = require('defenseModule');
var constructionModule = require('constructionModule');
var unitControlModule = require('unitControlModule');
var squadControlModule = require('squadControlModule');

var main = function () {

    for (let i in Game.rooms) {
        const roomName = Game.rooms[i].name;

        if (Game.rooms[roomName].hasCreep == undefined) {
            Room.prototype.hasCreep = function (creepRole) {
                if (_.filter(Game.rooms[this.name].find(FIND_MY_CREEPS), creep => creep.memory.role == creepRole).length) {
                    return true;
                }
                return false;
            };
        }

        unitControlModule.run(roomName);
        constructionModule.run(roomName);
        defenseModule.run(roomName);
    }

    squadControlModule.run();
};

module.exports.loop = main;
