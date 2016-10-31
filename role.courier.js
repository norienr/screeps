const roleCourier = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = false;
        }

        if (creep.memory.harvesting) {
            if (creep.carry.energy < creep.carryCapacity) {
                const source = creep.pos.findClosestByRange(FIND_SOURCES);
                const conts = _.filter(creep.room.find(FIND_STRUCTURES),
                    s => (s.structureType === STRUCTURE_CONTAINER ||
                    s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_TERMINAL) &&
                    s.store[RESOURCE_ENERGY] > 0);
                conts.push(source);
                const s = creep.pos.findClosestByRange(conts);
                if (s.structureType === undefined) { // -> source
                    if (creep.harvest(s) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(s);
                    }
                } else {
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
                    s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity);
                }
            });
            if (targets.length) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                roleUpgrader.run(creep);
            }
        }
    }
};

module.exports = roleCourier;
