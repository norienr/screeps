const roleBuilder = require('role.builder');

const roleMiner = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const site = Game.getObjectById(creep.memory.siteId);
        if (site != null && site.progress < site.progressTotal) {

            if (creep.memory.building && creep.carry.energy === 0) {
                creep.memory.building = false;
            }
            if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
                creep.memory.building = true;
            }

            if (creep.memory.building) {
                if (creep.build(Game.getObjectById(creep.memory.siteId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.siteId));
                }
            } else {
                if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.sourceId));
                }
            }
        } else {
            const cont = Game.getObjectById(creep.memory.containerId);
            if (cont.store[RESOURCE_ENERGY] < cont.storeCapacity) {
                if (creep.carry.energy < creep.carryCapacity) {
                    const src = Game.getObjectById(creep.memory.sourceId);
                    if (creep.harvest(src) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(src);
                    }
                } else {
                    if (creep.transfer(cont, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(cont);
                    }
                }
            } else {
                roleBuilder.run(creep);
            }


        }
    }
};

module.exports = roleMiner;
