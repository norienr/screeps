var Config = require('config');

var constructionModule = (function () {

    var o = {
        getStructures: function (roomName, structureType) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                struct => struct.structureType == structureType
            );
        },
        getClosestSourceTo(roomName, x0, y0) {
            const srcs = Game.rooms[roomName].find(FIND_SOURCES);

            const pos = new RoomPosition(x, y);

            const src = _.reduce(srcs, function (s, x) {
                if (pos.getRangeTo(x.pos) < pos.getRangeTo(s.pos)) {
                    return x;
                }
                return s;
            });
            return {x: src.pos.x, y: src.pos.y};
        },
        buildStructure: function (roomName, type) {
            if (type == STRUCTURE_ROAD) {
                const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                const spawnPos = new RoomPosition(spawns[0].pos.x, spawns[0].pos.y, roomName);
                const closestSource = _.clone(o.getClosestSourceTo(roomName, spawnPos.x, spawnPos.y));
                const srcPos = new RoomPosition(closestSource.x, closestSource.y, roomName);
                this.buildRoad(roomName, spawnPos, srcPos);
                return OK;// always enough for the first structure
            }
            else {
                const p = this.getStructures(roomName, STRUCTURE_SPAWN);
                return Game.rooms[roomName].createConstructionSite(p.x - 5, p.y, type);
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
                    if (o.buildStructure(roomName, Game.rooms[roomName].memory.buildQueue[0]) == OK) {
                        Game.rooms[roomName].memory.buildQueue.shift();
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = constructionModule;