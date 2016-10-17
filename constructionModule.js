var Config = require('config');

var constructionModule = (function () {

    const WORK_PRIORITIES = [
        Config.ROLE_HARVESTER,
        ];

    var o = {
        getStructures: function (roomName, structureType) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                struct => struct.structureType == structureType
            );
        },
        getClosestSourceTo(roomName, x0, y0) {
            const srcs = Game.rooms[roomName].find(FIND_SOURCES);

            function path(x1, y1, x2, y2) {
                return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
            }

            const src = _.reduce(srcs, function (s, x) {
                if (path(x0, y0, x.pos.x, x.pos.y) < path(x0, y0, s.pos.x, s.pos.y)) {
                    return x;
                }
                return s;
            });
            return {x: src.pos.x, y: src.pos.y};
        },
        buildRoad(roomName, startPos, endPos) {
            const path = Game.rooms[roomName].findPath(startPos, endPos, {
                ignoreCreeps: true,
                maxOps: 1000
            });
            _.forEach(path, p => Game.rooms[roomName].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));
        }
    };

    var publicAPI = {
        run: function (roomName) {

            if (Game.rooms[roomName].hasCreep(Config.ROLE_BUILDER)) {
                if (Game.rooms[roomName].memory.hasRoads === undefined) {
                    const spawns = o.getStructures(roomName, STRUCTURE_SPAWN);
                    const spawnPos = new RoomPosition(spawns[0].pos.x, spawns[0].pos.y, roomName);
                    const closestSource = _.clone(o.getClosestSourceTo(roomName, spawnPos.x, spawnPos.y));
                    const srcPos = new RoomPosition(closestSource.x, closestSource.y, roomName);


                    o.buildRoad(roomName, spawnPos, srcPos);
                    Game.rooms[roomName].memory.hasRoads = true;
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = constructionModule;