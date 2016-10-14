var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.waiting === undefined) {
            creep.memory.waiting = false;
        }

        if (!creep.memory.waiting && (creep.carry.energy < creep.carryCapacity)) {
            var sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                for (let i in Game.creeps) {
                    let unit = Game.creeps[i];
                    if (unit.memory.role == 'upgrader') {
                        if (creep.transfer(unit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(unit);
                        }
                        if (creep.carry.energy) {
                            if (!creep.memory.waiting) {
                                creep.memory.waiting = true;
                            }
                        } else {
                            if (creep.memory.waiting) {
                                creep.memory.waiting = false;
                                creep.say('harvesting');
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = roleHarvester;