const roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = false;
        }

        if (creep.memory.harvesting) {
            if (creep.carry.energy < creep.carryCapacity) {
                const source = creep.pos.findClosestByRange(FIND_SOURCES);
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            } else {
                creep.memory.harvesting = false;
            }
        }

        if (creep.carry.energy === 0) {
            creep.memory.harvesting = true;
        }

        if (!creep.memory.harvesting) {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return ((s.structureType === STRUCTURE_EXTENSION ||
                    s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity);
                }
            });
            if (targets.length) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
    }
};

module.exports = roleHarvester;
