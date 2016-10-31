const roleHarvester = require('role.harvester');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep, ...sites) {

        if (creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
        }

        if (creep.memory.building) {
            let targets = [];
            if (sites.length === 0) {
                targets = _.filter(creep.room.find(FIND_CONSTRUCTION_SITES),
                    s => _.filter(creep.room.memory.containers, x => x.siteId === s.id).length === 0);
            } else {
                targets = _.filter(creep.room.find(FIND_CONSTRUCTION_SITES),
                    s => _.filter(sites, s2 => s2.id === s.id).length);
            }

            if (targets.length) {
                creep.memory.canBuild = false;
                if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                creep.memory.canBuild = true;
                roleHarvester.run(creep);
            }
        } else {
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

module.exports = roleBuilder;
