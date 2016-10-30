var roleTransporter = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const room = creep.room;

        const structs = _.filter(room.find(FIND_STRUCTURES),
            s => s.structureType === STRUCTURE_CONTAINER &&
            s.store[RESOURCE_ENERGY] < s.storeCapacity &&
            _.filter(room.memory.containers, x => x.containerId === s.id).length === 0);

        if (structs.length) {
            const srcs = _.filter(room.find(FIND_STRUCTURES),
                s => s.structureType === STRUCTURE_CONTAINER &&
                _.filter(room.memory.containers, x => x.containerId === s.id).length &&
                s.store[RESOURCE_ENERGY] > 0);

            if (creep.carry.energy < creep.carryCapacity) {
                if (srcs.length) {
                    const s = creep.pos.findClosestByRange(srcs);
                    if (s.transfer(creep, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(s);
                    }
                }
            } else {
                if (creep.transfer(structs[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structs[0]);
                }
            }
        }
    }
};

module.exports = roleTransporter;
