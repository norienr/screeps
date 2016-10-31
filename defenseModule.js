var Config = require('config');

var defenseModule = (function () {
    var o = {
        getTowers: function (roomName) {
            return Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {
                    filter: {structureType: STRUCTURE_TOWER}
                });
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
                    Memory.lastRepair[tower.id] = Game.time;
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

            if (Memory.lastRepair === undefined) {
                Memory.lastRepair = {};
            }

            const targets = _.filter(Game.rooms[roomName].find(FIND_HOSTILE_CREEPS),
                c => c.owner.username !== 'Source Keeper');

            if (targets.length) {
                Game.rooms[roomName].underAttack = true;

                let towers;
                if ((towers = o.getTowers(roomName)).length) {

                    if (targets.length) {
                        towers.forEach(
                            tower => o.attackThreats(tower, targets));
                    } else if (o.hasDamagedStructs(roomName)) {
                        _.forEach(towers, (tower) => {
                            if (Memory.lastRepair[tower.id] === undefined) {
                                Memory.lastRepair[tower.id] = 0;
                            }
                            if (Game.time > (Memory.lastRepair[tower.id] + Config.TOWER_ATTACK_INTERVAL)) {
                                o.doRepair(tower, o.getClosestDamagedStructs(tower));
                            }
                        });
                    }
                }
            } else {
                Game.rooms[roomName].underAttack = false;
            }


        }
    };

    return publicAPI;
})();

module.exports = defenseModule;
