var Config = require('config');

var defenseModule = (function () {
    var o = {
        getTowers: function (roomName) {
            return Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {
                    filter: {structureType: STRUCTURE_TOWER}
                });
        },
        spottedThreats: function (roomName) {
            return (Game.rooms[roomName].find(FIND_HOSTILE_CREEPS)).length;
        },
        hasDamagedStructs: function (roomName) {
            return Game.rooms[roomName].find(
                FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                }).length;
        },
        getClosestDamagedStructs: function (tower) {
            return tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
        },
        doRepair: function (tower, closestDamagedStructure) {
            if (closestDamagedStructure) {
                if (tower.repair(closestDamagedStructure) == OK) {
                    tower.memory.lastRepairedAt = Game.time;
                }
            }
        },
        attackThreats: function (tower, closestThreat) {
            if (closestThreat) {
                tower.attack(closestThreat);
            }
        }
    };

    var publicAPI = {
        run: function (roomName) {

            let towers;
            if ((towers = o.getTowers(roomName)).length) {

                if (tower.memory.lastRepairedAt == undefined) {
                    tower.memory.lastRepairedAt = Game.time;
                }

                if (o.spottedThreats(roomName)) {
                    towers.forEach(
                        tower => o.attackThreats(tower, tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                        ));
                } else if (o.hasDamagedStructs(roomName)) {
                    _.forEach(towers, function (tower) {
                        if (Game.time > (tower.memory.lastRepairedAt + Config.TOWER_ATTACK_INTERVAL)) {
                            o.doRepair(tower, o.getClosestDamagedStructs(tower));
                        }
                    });
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = defenseModule;
