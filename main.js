var defenseModule = require('defenseModule');
var unitControlModule = require('unitControlModule');
var constructionModule = require('constructionModule');

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

};

module.exports.loop = main;
