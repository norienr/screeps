const Config = require('config');
const roleMiner = require('role.miner');

var MODULE = (function (module) {
    'use strict';

    module.hasMinerAssigned = function (room, source) {
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role === Config.ROLE_MINER &&
            typeof creep.memory.sourceId !== 'undefined' &&
            creep.memory.sourceId === source.id).length;
    };

    module.hasHostilesAround = function (room, source) {
        if (room.memory.dangerSources === undefined) {
            room.memory.dangerSources = [];
        }
        if (room.memory.dangerSources.length === 0) {
            const x1 = source.pos.x - 2;
            const x2 = source.pos.x + 2;
            const y1 = source.pos.y - 2;
            const y2 = source.pos.y + 2;
            const posArr = room.lookForAtArea(LOOK_CREEPS, y1, x1, y2, x2, true);
            const filtered = _.filter(posArr, p => p.creep.owner.username === 'Source Keeper');
            if (filtered.length) {
                room.memory.dangerSources.push(source.id);
            }
            return filtered.length;
        } else {
            return _.filter(room.memory.dangerSources, s => s === source.id).length;
        }
    };

    module.findUnassignedSource = function (creep) {
        const srcs = _.filter(creep.room.find(FIND_SOURCES),
            src => !module.hasMinerAssigned(creep.room, src) && !module.hasHostilesAround(creep.room, src));
        return srcs[0];
    };

    module.initMiner = function (creep) {

        if (typeof creep.memory.sourceId === 'undefined') {
            const src = module.findUnassignedSource(creep);
            if (typeof src !== 'undefined') {
                creep.memory.sourceId = src.id;
            }
        } else {
            const conts = _.filter(creep.room.find(FIND_STRUCTURES),
                s => (s.structureType === STRUCTURE_CONTAINER) &&
                s.pos.isNearTo(Game.getObjectById(creep.memory.sourceId)));
            if (conts.length) {
                roleMiner.run(creep, conts[0].id);
            } else {
                console.log('Please, build container for miner');
            }
        }

    };
    return module;
})(MODULE || {});

module.exports = MODULE;
