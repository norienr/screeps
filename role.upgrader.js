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
            const conts = _.filter(creep.room.find(FIND_STRUCTURES),
                s => (s.structureType === STRUCTURE_CONTAINER ||
                s.structureType === STRUCTURE_STORAGE ||
                s.structureType === STRUCTURE_TERMINAL) &&
                s.store[RESOURCE_ENERGY] > 50);

            if (conts.length) {
                const s = creep.pos.findClosestByRange(conts);
                if (s.transfer(creep, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(s);
                }
            } else {
                const source = creep.pos.findClosestByRange(FIND_SOURCES);
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};

module.exports = roleUpgrader;
