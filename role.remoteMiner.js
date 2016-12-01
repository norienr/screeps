/**
 * To create remoteMiner creep you need:
 * 1. createFlag on the source of another room
 * 2. assign flag name and role a to creep, e.g:
 *  Game.spawns.Spawn1.createCreep([MOVE, WORK, WORK, CARRY], null,
 *  {role: 'remoteMiner', flag: 'RemoteMining' });
 *
 *  Creep creates and builds container automatically, if there are no container near remote source
 */
const roleRemoteMiner = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const flag = Game.flags[creep.memory.flag];
        if (creep.pos.getRangeTo(flag) > 1) {
            creep.moveTo(flag);
        } else {
            const cont = Game.getObjectById(creep.memory.containerId);
            const src = flag.pos.findInRange(FIND_SOURCES, 1)[0];
            if (cont) {
                if (creep.memory.harvesting) {
                    if (creep.carry.energy < creep.carryCapacity) {
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
                    if (cont.hits < (cont.hitsMax / 1.5)) {
                        if (creep.repair(cont) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(cont);
                        }
                    } else if (cont.store[RESOURCE_ENERGY] < cont.storeCapacity) {
                        if (creep.transfer(cont, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(cont);
                        }
                    }
                }
            } else {
                let construction_site = src.pos.findInRange(FIND_CONSTRUCTION_SITES, 1,
                    {filter: function (structure) {
                        return (structure.structureType === STRUCTURE_CONTAINER);
                    }})[0];
                if (construction_site) {
                    // console.log('if(construction_site)'+construction_site);
                    if (creep.carry.energy < creep.carryCapacity) {
                        creep.harvest(src);
                    } else if (creep.build(construction_site) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(construction_site);
                    }
                } else {
                    let containerr = src.pos.findInRange(FIND_STRUCTURES, 1,
                        {filter: function (structure) {
                            return (structure.structureType === STRUCTURE_CONTAINER);
                        }})[0];
                    if (containerr) {
                        creep.memory.containerId = containerr.id;
                    }
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                }
            }
        }
    }
};

module.exports = roleRemoteMiner;
