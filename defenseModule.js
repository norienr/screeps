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
                });
        },
        getClosestDamagedStructs: function (tower) {
            return tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
        },
        doRepair: function (tower, closestDamagedStructure) {
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        },
        attackThreats: function (tower, closestThreat) {
            if (closestThreat) {
                tower.attack(closestThreat);
            }
        },
    };

    var publicAPI = {
        run: function (roomName) {

            let towers;
            if ((towers = o.getTowers(roomName)).length) {

                if (o.spottedThreats(roomName)) {
                    towers.forEach(
                        tower => o.attackThreats(tower, tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                        ));
                } else if (o.hasDamagedStructs(roomName)) {
                    towers.forEach(
                        tower => o.doRepair(tower, o.getClosestDamagedStructs(tower))
                    );
                }
            }

        }
    };

    return publicAPI;
})();

module.exports = defenseModule;