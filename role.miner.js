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
            if (cont) {
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
                    const conts = _.filter(creep.room.find(FIND_STRUCTURES),
                        s => (s.structureType === STRUCTURE_CONTAINER) &&
                        s.store[RESOURCE_ENERGY] < s.storeCapacity / 2);
                    if (conts.length) {
                        if (creep.carry.energy < creep.carryCapacity) {
                            const src = creep.pos.findClosestByRange(FIND_SOURCES);
                            if (creep.harvest(src) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(src);
                            }
                        } else {
                            if (creep.transfer(conts[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(conts[0]);
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = roleMiner;
