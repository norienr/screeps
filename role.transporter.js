
var roleTransporter = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const room = creep.room;

        const srcs = _.filter(room.find(FIND_STRUCTURES),
            s => s.memory.level !== undefined && s.memory.level === 2 && (s.structureType === STRUCTURE_CONTAINER ||
            s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL));

        if (srcs.length) {
            const container = Game.getObjectById(creep.memory.containerLvl2Id);
            const sorted = _.sort(srcs, s => s.store[RESOURCE_ENERGY]);
            console.log(srcs.length === sorted.length);
            if (creep.carry.energy < creep.carryCapacity) {
                if (creep.harvest(container) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
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
