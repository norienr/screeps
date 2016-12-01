const roleRemoteTransporter = {
    /** @param {Creep} creep **/
    run: (creep) => {
        const flag = Game.flags[creep.memory.flag];
        if (!creep.memory.homeRoom) {
            creep.memory.homeRoom = creep.room.name;
        }
        if (creep.memory.homeRoom === creep.room.name && creep.carry.energy === 0) {
            creep.moveTo(flag);
        } else {
            if (!creep.memory.containerId) {
                creep.memory.containerId = flag.pos.findInRange(FIND_STRUCTURES, 1,
                    {filter: function (structure) {
                        return (structure.structureType === STRUCTURE_CONTAINER);
                    }})[0].id;
            }
            const homeRoom = Game.rooms[creep.memory.homeRoom];
            const container = Game.getObjectById(creep.memory.containerId);

            if (creep.memory.harvesting) {
                if (creep.carry.energy < creep.carryCapacity) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                } else {
                    creep.memory.harvesting = false;
                }
            }

            if (creep.carry.energy === 0) {
                creep.memory.harvesting = true;
            }

            if (!creep.memory.harvesting) {
                // console.log(!creep.memory.harvesting);
                const structs = homeRoom.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_STORAGE ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER ||
                            structure.structureType === STRUCTURE_TERMINAL)
                            && structure.energy < structure.energyCapacity;
                    }
                });
                if (structs.length) {
                    if (creep.transfer(structs[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structs[0]);
                    }
                }
            }
        }
    }
};

module.exports = roleRemoteTransporter;
