var defenseModule = {
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
    run: function () {
        for (let i in Game.rooms) {
            const roomName = Game.rooms[i].name;

            let towers;
            if ((towers = this.getTowers(roomName)).length) {

                if (this.spottedThreats(roomName)) {
                    towers.forEach(
                        tower => this.attackThreats(tower, tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                        ));
                } else if (this.hasDamagedStructs(roomName)) {
                    towers.forEach(
                        tower => this.doRepair(tower, this.getClosestDamagedStructs(tower))
                    );
                }
            }
        }
    }
};

module.exports = defenseModule;