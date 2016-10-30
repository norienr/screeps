var Config = require('config');

var constructionModule = (function () {

    var o = {
        getStructures: function (roomName, structureType) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                struct => struct.structureType == structureType
            );
        },
        buildStructureAutoPos: function (roomName, structurePayload) {
            if (structurePayload.type == STRUCTURE_ROAD) {
                const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                const spawnPos = new RoomPosition(spawns[0].pos.x, spawns[0].pos.y, roomName);
                const closestSource = _.clone((spawns[0].pos.findClosestByRange(FIND_SOURCES)).pos);
                const srcPos = new RoomPosition(closestSource.x, closestSource.y, roomName);
                this.buildRoad(roomName, spawnPos, srcPos);
                return OK;// always enough for the first structure
            } else {
                return -1; // no other auto-build structs defined yet
            }
        },
        buildStructure: function (roomName, structurePayload) {
            if (structurePayload.pos === undefined) {
                this.buildStructureAutoPos(roomName, structurePayload);
            } else {
                return Game.rooms[roomName].createConstructionSite(structurePayload.pos.x, structurePayload.pos.y,
                    structurePayload.type);
            }
        },
        buildRoad: function (roomName, startPos, endPos) {
            const path = Game.rooms[roomName].findPath(startPos, endPos, {
                ignoreCreeps: true,
                maxOps: 1000
            });
            _.forEach(path, p => Game.rooms[roomName].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));
        },
        locateLvl2ContainerPos: function (roomName, spawn) {
            const x1 = spawn.pos.x - 3;
            const x2 = spawn.pos.x + 3;
            const y1 = spawn.pos.y - 3;
            const y2 = spawn.pos.y + 3;
            const posArr = Game.rooms[roomName].lookForAtArea(LOOK_TERRAIN, y1, x1, y2, x2, true);
            const filtered = _.filter(posArr, p => p.terrain === 'plain' &&
            p.x != spawn.pos.x && p.y != spawn.pos.y && p.x != spawn.pos.x - 1 && p.y != spawn.pos.y - 1 &&
            p.x != spawn.pos.x + 1 && p.y != spawn.pos.y + 1);
            let positions = [];
            _.forEach(filtered, f => positions.push(new RoomPosition(f.x, f.y, Game.rooms[roomName].name)));
            if (positions.length) {
                return positions;
            } else {
                return false;
            }
        }
    };

    var publicAPI = {
        run: function (roomName) {

            if (Game.rooms[roomName].memory.buildQueue === undefined) {
                Game.rooms[roomName].memory.buildQueue = [];
                Game.rooms[roomName].memory.queueInitialized = false;
            }

            if (Game.rooms[roomName].hasCreep(Config.ROLE_BUILDER)) {
                if (!Game.rooms[roomName].memory.queueInitialized) {
                    _.forEach(Config.STRUCTURES, function (structure) {
                        if (structure.type === STRUCTURE_CONTAINER) {
                            if (structure.level === 2) {
                                const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                                const containers = o.locateLvl2ContainerPos(roomName, spawns[0]);
                                if (containers.length) {
                                    structure.pos = {x: containers[0].x, y: containers[0].y};
                                    Game.rooms[roomName].memory.buildQueue.push(structure);
                                }
                            }
                        } else {
                            Game.rooms[roomName].memory.buildQueue.push(structure);
                        }
                    });
                    Game.rooms[roomName].memory.queueInitialized = true;
                }

                if (Game.rooms[roomName].memory.buildQueue.length) {
                    if (_.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
                            creep => creep.memory.canBuild === true).length) {
                        if (o.buildStructure(roomName, Game.rooms[roomName].memory.buildQueue[0]) === OK) {
                            Game.rooms[roomName].memory.buildQueue.shift();
                        } else {
                            const structure = Game.rooms[roomName].memory.buildQueue[0];
                            if (structure.type === STRUCTURE_CONTAINER) {
                                const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                                const containers = o.locateLvl2ContainerPos(roomName, spawns[0]);
                                if (containers.length > 1) {
                                    structure.pos = {x: containers[1].x, y: containers[1].y};
                                    Game.rooms[roomName].memory.buildQueue.shift();
                                    Game.rooms[roomName].memory.buildQueue.push(structure);
                                }
                            }

                        }
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = constructionModule;
