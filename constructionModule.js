var constructionModule = (function () {

    const MIN_EXTENSION_NUM = 1;

    var o = {
        getStructures: function (roomName, structureType) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                struct => struct.structureType == structureType
            );
        },
        getClosestSourceTo(x0, y0) {
            const srcs = Game.rooms[roomName].find(FIND_SOURCES);
            return _.reduce(srcs, function (s, x) {
                function path(x1, y1, x2, y2) {
                    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
                }

                if (path(x0, y0, x.pos.x, x.pos.y) < path(x0, y0, s.pos.x, s.pos.y)) {
                    return x;
                }
                return s;
            });
        }
    };

    var publicAPI = {
        run: function () {

            for (let i in Game.rooms) {
                const roomName = Game.rooms[i].name;

                let spawn = o.getStructures(roomName, STRUCTURE_SPAWN);
                if (o.getStructures(roomName, STRUCTURE_EXTENSION).length < MIN_EXTENSION_NUM) {
                    let x = spawn[0].pos.x;
                    let y = spawn[0].pos.y;
                    if (Game.rooms[i].createConstructionSite(x - 2, y, STRUCTURE_EXTENSION) == ERR_INVALID_TARGET) {
                        //TODO: FIND ANOTHER LOCATION
                    }
                }
            }

        }
    };

    return publicAPI;
})();

module.exports = constructionModule;