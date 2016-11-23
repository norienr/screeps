const roleTransporter = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const room = creep.room;

        if (creep.memory.harvesting) {
            if (creep.carry.energy < creep.carryCapacity) {
                const srcs = _.filter(room.find(FIND_STRUCTURES),
                    cont => cont.structureType === STRUCTURE_CONTAINER &&
                    _.filter(room.find(FIND_SOURCES), src => cont.pos.isNearTo(src)).length &&
                    cont.store[RESOURCE_ENERGY] > 0);
                if (srcs.length) {
                    const s = creep.pos.findClosestByRange(srcs);
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
            const structs = _.filter(room.find(FIND_STRUCTURES),
                s => s.structureType === STRUCTURE_CONTAINER &&
                s.store[RESOURCE_ENERGY] < s.storeCapacity &&
                _.filter(room.memory.containers, x => x.containerId === s.id).length === 0);
            if (structs.length) {
                if (creep.transfer(structs[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structs[0]);
                }
            }
        }
    }
};

module.exports = roleTransporter;
