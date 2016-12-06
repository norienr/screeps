const roleCourier = {

    run: function (creep) {
        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = false;
        }

        if (creep.memory.harvesting) {
            if (creep.carry.energy < creep.carryCapacity) {
                const conts = _.filter(creep.room.find(FIND_STRUCTURES),
                    s => (s.structureType === STRUCTURE_CONTAINER ||
                    s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_TERMINAL) &&
                    _.filter(creep.room.find(FIND_SOURCES), src => s.pos.isNearTo(src)).length === 0 &&
                    s.store[RESOURCE_ENERGY] > 0);
                if (conts.length) {
                    const s = creep.pos.findClosestByRange(conts);
                    if (s.transfer(creep, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(s);
                    }
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
                    //s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity);
                }
            });
            if (targets.length) {
                
                //First we should fill tower it has less than 50% of energy
                let towers = _.filter(targets,
                    (s) => s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity / 2);

                let target;
                if (towers.length) {
                    target = towers[0];
                } else {
                    target = targets[0];
                }

                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
};

module.exports = roleCourier;
