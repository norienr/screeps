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
                targets = creep.room.find(FIND_CONSTRUCTION_SITES);
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
            const conts = _.filter(creep.room.find(FIND_STRUCTURES),
                s => s.structureType === STRUCTURE_CONTAINER ||
                s.structureType === STRUCTURE_STORAGE ||
                s.structureType === STRUCTURE_TERMINAL);

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

module.exports = roleBuilder;
