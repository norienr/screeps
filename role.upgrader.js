var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
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
        }
    }
};

module.exports = roleUpgrader;
