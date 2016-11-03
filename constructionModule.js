var Config = require('config');

var constructionModule = (function () {

    var o = {
        getStructures: function (roomName, structureType) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                struct => struct.structureType == structureType
            );
        },
        buildRoadAutoPos: function (roomName, structurePayload) {
            if (structurePayload.type == STRUCTURE_ROAD) {
                const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                const spawnPos = new RoomPosition(spawns[0].pos.x, spawns[0].pos.y, roomName);
                const closestSource = _.clone((spawns[0].pos.findClosestByRange(FIND_SOURCES)).pos);
                const srcPos = new RoomPosition(closestSource.x, closestSource.y, roomName);
                this.buildRoad(roomName, spawnPos, srcPos);
                return OK;// always enough for the first structure
            } else {
                return -1; // no other auto-build structs supported
            }
        },
        buildStructure: function (roomName, structurePayload) {
            if (structurePayload.pos === undefined) {
                this.buildRoadAutoPos(roomName, structurePayload);
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
        locatePosNearObject: function (roomName, spawn, radius) {
            const x1 = spawn.pos.x - radius;
            const x2 = spawn.pos.x + radius;
            const y1 = spawn.pos.y - radius;
            const y2 = spawn.pos.y + radius;
            const posArr = Game.rooms[roomName].lookForAtArea(LOOK_TERRAIN, y1, x1, y2, x2, true);
            const posPlain = _.filter(posArr, p => p.terrain === 'plain' &&
            p.x != spawn.pos.x && p.y != spawn.pos.y && p.x != spawn.pos.x - 1 && p.y != spawn.pos.y - 1 &&
            p.x != spawn.pos.x + 1 && p.y != spawn.pos.y + 1);

            const sites = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES);

            const filteredQueue = _.filter(posPlain, p => _.filter(Game.rooms[roomName].memory.buildQueue,
                o => o.pos.x === p.x && o.pos.y === p.y).length === 0);

            const filtered = _.filter(filteredQueue, p => _.filter(sites,
                s => s.pos.x === p.x && s.pos.y === p.y).length === 0);

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
                    _.forEach(Config.STRUCTURES, (structure) => {
                        if (structure.pos === undefined) {
                            const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                            let radius = Config.DEFAULT_POS_RADIUS;
                            if (structure.type === STRUCTURE_EXTENSION) {
                                radius = Config.EXTENSIONS_POS_RADIUS;
                            } else if (structure.type === STRUCTURE_CONTAINER) {
                                radius = Config.CONTAINERS_POS_RADIUS;
                            }

                            const containers = o.locatePosNearObject(roomName, spawns[0], radius);
                            if (containers.length > 1) {
                                structure.pos = {x: containers[1].x, y: containers[1].y};
                                Game.rooms[roomName].memory.buildQueue.push(structure);
                            } else {
                                console.log('cannot locate position');
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
                        const res = o.buildStructure(roomName, Game.rooms[roomName].memory.buildQueue[0]);
                        if (res === OK) {
                            Game.rooms[roomName].memory.buildQueue.shift();
                        } else {
                            Game.rooms[roomName].memory.buildQueue.push(Game.rooms[roomName].memory.buildQueue.shift());
                            console.log(`cannot build: ${res}`);
                        }
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = constructionModule;
