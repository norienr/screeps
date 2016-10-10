var defenseModule = {
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
    run: function () {

        for (let i in Game.rooms) {

            let roomName = Game.rooms[i].name;
            let towers = Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {
                    filter: {structureType: STRUCTURE_TOWER}
                });

            if (towers.length) {

                let threats = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
                if (threats.length) {
                    towers.forEach(tower => attackThreats(tower, tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)));
                }

                towers.forEach(tower => doRepair(tower, tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                })));
            }


        }
    }
};

module.exports = defenseModule;