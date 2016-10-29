var roleMiner = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const room = creep.room;

        const site = Game.getObjectById(creep.memory.siteId);
        if (site.progress < site.progressTotal) {

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
            const containers = creep.room.lookForAt(LOOK_STRUCTURES,
                new RoomPosition(site.pos.x, site.pos.y, room.name));
            if (containers.length) {
                const cont = containers[0];

                if (creep.carryEnergy === 0) {
                    if (creep.harvest(cont) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(cont);
                    }
                } else if (creep.carryEnergy === creep.carryCapacity) {
                    if (creep.transfer(cont, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(cont);
                    }
                }
            }
        }
    }
};

module.exports = roleMiner;
