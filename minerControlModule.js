const Config = require('config');
const roleMiner = require('role.miner');
var MODULE = require('transporterControlModule');

MODULE = (function (module) {

    module.locateContainerPos = function (room, source) {
        const x1 = source.pos.x - 5;
        const x2 = source.pos.x + 5;
        const y1 = source.pos.y - 5;
        const y2 = source.pos.y + 5;
        const posArr = room.lookForAtArea(LOOK_TERRAIN, y1, x1, y2, x2, true);
        const filtered = _.filter(posArr, p => p.terrain === 'plain' &&
        p.x != source.pos.x && p.y != source.pos.y && p.x != source.pos.x - 1 && p.y != source.pos.y - 1 &&
        p.x != source.pos.x + 1 && p.y != source.pos.y + 1);
        let positions = [];
        _.forEach(filtered, f => positions.push(new RoomPosition(f.x, f.y, room.name)));
        if (positions.length) {
            const res = source.pos.findClosestByPath(positions);
            return res;
        } else {
            return false;
        }
    };

    module.hasMinerAssigned = function (room, source) {
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role === Config.ROLE_MINER &&
            creep.memory.sourceId != undefined &&
            creep.memory.sourceId === source.id).length;
    };

    module.hasHostilesAround = function (room, source) {
        if (room.memory.dangerSources === undefined) {
            room.memory.dangerSources = [];
        }
        if (room.memory.dangerSources.length === 0) {
            const x1 = source.pos.x - 10;
            const x2 = source.pos.x + 10;
            const y1 = source.pos.y - 10;
            const y2 = source.pos.y + 10;
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
        return creep.pos.findClosestByRange(srcs);
    };

    module.initMiner = function (creep) {
        const room = creep.room;
        if (room.memory.containers === undefined) {
            room.memory.containers = [];
        }

        if (creep.memory.sourceId === undefined) {
            const src = module.findUnassignedSource(creep);
            if (src != undefined) {
                const container = _.filter(room.memory.containers,
                    x => x.sourceId === src.id);
                if (container.length) {
                    creep.memory.sourceId = container[0].sourceId;
                    creep.memory.siteId = container[0].siteId;
                    if (container[0].containerId != undefined) {
                        creep.memory.containerId = container[0].containerId;
                    }
                } else { // need to add
                    const container = module.locateContainerPos(room, src);
                    if (container) {
                        const res = room.createConstructionSite(container.x, container.y,
                            STRUCTURE_CONTAINER);
                        if (res === OK) {
                            creep.memory.sourceId = src.id;
                            creep.memory.needsInit = container;
                        } else {
                            console.log(`cannot build container: ${res}`);
                        }
                    }
                }
            }
        } else {
            if (creep.memory.needsInit) {
                const container = creep.memory.needsInit;
                const site = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES,
                    new RoomPosition(container.x,
                        container.y, room.name));
                if (site.length) {
                    creep.memory.siteId = site[0].id;
                    room.memory.containers.push({
                        siteId: site[0].id,
                        sourceId: creep.memory.sourceId,
                        x: site[0].pos.x,
                        y: site[0].pos.y
                    });
                    creep.memory.needsInit = undefined;
                } else {
                    console.log('cannot assign site');
                }
            } else {
                const site = Game.getObjectById(creep.memory.siteId);
                if (site === null && creep.memory.containerId === undefined) {
                    const conts = _.filter(room.memory.containers,
                        x => x.siteId === creep.memory.siteId);
                    if (conts.length) {
                        const containers = creep.room.lookForAt(LOOK_STRUCTURES,
                            new RoomPosition(conts[0].x,
                                conts[0].y, room.name));
                        if (containers.length) {
                            creep.memory.containerId = containers[0].id;
                            conts[0].containerId = containers[0].id;
                        } else {
                            console.log('cannot init container');
                        }
                    }
                } else {
                    roleMiner.run(creep);
                }
            }
        }
    };
    return module;
})(MODULE || {});

module.exports = MODULE;
