let prototypesInitializer = (function () {
    'use strict';

    let prots = {};

    prots.hasCreepInit = function (room) {
        if (typeof room.hasCreep === 'undefined') {
            Room.prototype.hasCreep = function (creepRole) {
                if (_.filter(room.find(FIND_MY_CREEPS), creep => creep.memory.role === creepRole).length) {
                    return true;
                }
                return false;
            };
        }
    };

    let obj = {};

    obj.init = function (roomName) {
        const room = Game.rooms[roomName];
        for (let prot in prots) {
            prots[prot](room);
        }
    };

    return obj;
})();

module.exports = prototypesInitializer;
