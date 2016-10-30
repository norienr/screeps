var roleTransporter = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const room = creep.room;

        const structs = _.filter(room.find(FIND_STRUCTURES),
            s => s.structureType === STRUCTURE_CONTAINER
            && _.filter(room.memory.containers, x => x.id === s.id).length);

        if (structs.length) {
            const srcs = _.filter(room.find(FIND_STRUCTURES),
                s => (s.structureType === STRUCTURE_CONTAINER ||
                s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL)
                && _.filter(room.memory.containers, x => x.id === s.id).length === 0);
            const sorted = _.sort(srcs, s => s.store[RESOURCE_ENERGY]);
            if (creep.carry.energy < creep.carryCapacity) {
                if (creep.harvest(structs[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structs[0]);
                }
            } else {
                if (creep.transfer(sorted[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sorted[0]);
                }
            }
        }
    }
};

module.exports = roleTransporter;
