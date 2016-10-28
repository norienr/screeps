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
                        Game.rooms[roomName].memory.buildQueue.push(structure);
                    });
                    Game.rooms[roomName].memory.queueInitialized = true;
                }

                if (_.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), creep => creep.memory.canBuild == true).length) {
                    if (o.buildStructure(roomName, Game.rooms[roomName].memory.buildQueue[0]) === OK) {
                        Game.rooms[roomName].memory.buildQueue.shift();
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = constructionModule;