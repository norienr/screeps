const roleMiner = {
    /** @param {Creep} creep **/
    run: (creep, containerId) => {
        const cont = Game.getObjectById(containerId);
        if (cont) {
            if (creep.memory.harvesting) {
                if (creep.carry.energy < creep.carryCapacity) {
                    const src = Game.getObjectById(creep.memory.sourceId);
                    if (creep.harvest(src) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(src);
                    }
                } else {
                    creep.memory.harvesting = false;
                }
            }

            if (creep.carry.energy === 0) {
                creep.memory.harvesting = true;
            }

            if (!creep.memory.harvesting) {
                if (cont.hits < cont.maxHits / 2) {
                    if (creep.repair(cont) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(cont);
                    }
                } else if (cont.store[RESOURCE_ENERGY] < cont.storeCapacity) {
                    if (creep.transfer(cont, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(cont);
                    }
                }
            }
        }
    }
};

module.exports = roleMiner;
