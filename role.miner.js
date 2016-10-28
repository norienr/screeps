var Config = require('config');

var roleMiner = (function () {

    var o = {
        locateContainerPos: function (room, source) {
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
        },
        hasMinerAssigned: function (room, source) {
            if (_.filter(room.find(FIND_MY_CREEPS),
                    creep => creep.memory.role == Config.ROLE_MINER &&
                    creep.memory.sourceId != undefined &&
                    Game.getObjectById(creep.memory.sourceId).pos == source.pos).length) {
                return true;
            }
            return false;
        },
        findUnassignedSource: function (room, creep) {
            const srcs = _.filter(room.find(FIND_SOURCES),
                src => !this.hasMinerAssigned(room, src));
            return creep.pos.findClosestByRange(srcs);
        },
        assignSource: function (source, creep) {
            creep.memory.sourceId = source.id;
        },
        assignContainer: function (container, creep) {
            creep.memory.containerId = container.id;
        },
        assignConstructionSite: function (site, creep) {
            creep.memory.siteId = site.id;
        },
        buildContainer: function (room, struct) {
            return room.createConstructionSite(struct.x, struct.y,
                STRUCTURE_CONTAINER);
        }
    };

    var publicAPI = {
        /** @param {Creep} creep **/
        run: function (creep) {
            const room = creep.room;
            if (creep.memory.sourceId === undefined) {
                const src = o.findUnassignedSource(room, creep);
                if (src != undefined) {
                    o.assignSource(src, creep);
                    const container = o.locateContainerPos(room, src);
                    if (container) {
                        if (o.buildContainer(room, container) === OK) {
                            creep.memory.siteContainerInit = container;
                        } else {
                            console.log('cannot build container');
                        }
                    }
                }
            } else {
                if (creep.memory.siteContainerInit != undefined) {
                    const site = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES,
                        new RoomPosition(creep.memory.siteContainerInit.x,
                            creep.memory.siteContainerInit.y, creep.memory.siteContainerInit.roomName));
                    o.assignConstructionSite(site[0], creep);
                    creep.memory.siteContainerInit = undefined;
                } else {
                    const site = Game.getObjectById(creep.memory.siteId);
                    console.log(JSON.stringify(site));
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
                            console.log('HARVESTING');
                            if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(Game.getObjectById(creep.memory.sourceId));
                            }
                        }
                    } else {
                        const found = creep.room.lookForAt(LOOK_STRUCTURES,
                            new RoomPosition(creep.memory.site.x, creep.memory.site.y, room));
                        if (found.length) {
                            o.assignContainer(found[0].id, creep);
                            console.log('assignedContainer');
                        }
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = roleMiner;
