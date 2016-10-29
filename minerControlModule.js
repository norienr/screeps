const Config = require('config');
const roleMiner = require('role.miner');
var MODULE = (function (module) {

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
            creep => creep.memory.role == Config.ROLE_MINER &&
            creep.memory.sourceId != undefined &&
            Game.getObjectById(creep.memory.sourceId).pos == source.pos).length;
    };

    module.findUnassignedSource = function (room, creep) {
        const srcs = _.filter(room.find(FIND_SOURCES),
            src => !module.hasMinerAssigned(room, src));
        return creep.pos.findClosestByRange(srcs);
    };

    module.initMiner = function (creep) {
        const room = creep.room;
        if (room.memory.containers === undefined) {
            room.memory.containers = [];
        }

        if (creep.memory.sourceId === undefined) {
            const src = module.findUnassignedSource(room, creep);
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
                    room.memory.containers.push({siteId: site[0].id, sourceId: creep.memory.sourceId});
                    console.log('pushed');
                    creep.memory.needsInit = undefined;
                } else {
                    console.log('cannot assign site');
                }
            } else {
                const site = Game.getObjectById(creep.memory.siteId);
                if (site.progress === site.progressTotal && !site.memory.inited) {
                    const container = creep.room.lookForAt(LOOK_STRUCTURES,
                        new RoomPosition(site.pos.x,
                            site.pos.y, room.name));
                    if (container != undefined) {
                        const cont = _.filter(room.memory.containers,
                            x => x.siteId === site.id);
                        creep.memory.containerId = container.id;
                        cont[0].containerId = container.id;
                        site.memory.inited = true;
                    } else {
                        console.log('cannot init container');
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
