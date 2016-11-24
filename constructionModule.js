var Config = require('config');

var constructionModule = (function () {

    var o = {
        getStructures: function (roomName, structureType) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                struct => struct.structureType === structureType
            );
        },
        buildStructure: function (roomName, structure) {
            return Game.rooms[roomName].createConstructionSite(structure.pos.x, structure.pos.y,
                structure.type);
        },
        buildRoad: function (roomName, startPos, endPos) {
            const path = Game.rooms[roomName].findPath(startPos, endPos, {
                ignoreCreeps: true,
                maxOps: 1000
            });
            _.forEach(path, p => Game.rooms[roomName].createConstructionSite(p.x, p.y, STRUCTURE_ROAD));
        },
        coroutine: function (g) {
            let it = g();
            return function () {
                return it.next.apply(it, arguments);
            };
        },
        posGen: function*() {
            let positions = (yield null);
            for (let i = 0; i < positions.length; ++i) {
                yield positions.shift();
            }
        },
        locatePosNearObject: function (roomName, obj, radius) {
            const x1 = obj.pos.x - radius;
            const x2 = obj.pos.x + radius;
            const y1 = obj.pos.y - radius;
            const y2 = obj.pos.y + radius;
            const posArr = Game.rooms[roomName].lookForAtArea(LOOK_TERRAIN, y1, x1, y2, x2, true);
            const posPlain = _.filter(posArr, p => p.terrain === 'plain' &&
            JSON.stringify({x: p.x, y: p.y}) !== JSON.stringify({x: obj.pos.x, y: obj.pos.y}));

            const filteredQueue = _.filter(posPlain, p => _.filter(Game.rooms[roomName].memory.buildQueue,
                o => o.pos && o.pos.x === p.x && o.pos.y === p.y).length === 0);

            const sites = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES);
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
        /**
         * @deprecated [Construction module should not be used and all
         * the structures besides miner containers should be built manually.]
         */
        run: function (roomName) {

            const room = Game.rooms[roomName];

            if (room.memory.buildQueue === undefined) {
                room.memory.buildQueue = [];
                room.memory.queueInitialized = false;
            }

            if (room.hasCreep(Config.ROLE_BUILDER)) {
                if (!room.memory.queueInitialized) {
                    _.forEach(Config.STRUCTURES, (structure) => {
                        room.memory.buildQueue.push(structure);
                    });
                    room.memory.queueInitialized = true;
                }

                if (room.memory.buildQueue.length) {
                    if (_.filter(room.find(FIND_MY_CREEPS),
                            creep => creep.memory.canBuild === true).length) {
                        const structure = room.memory.buildQueue[0];
                        if (structure.pos === undefined) {
                            const nearObjs = o.getStructures(roomName, structure.near);
                            if (nearObjs.length) {
                                let positions = o.locatePosNearObject(roomName, nearObjs[0], structure.radius);
                                if (positions.length) {
                                    let getPosition = o.coroutine(o.posGen);
                                    let pos = getPosition().value || getPosition(positions).value;
                                    if (pos) {
                                        let res = o.buildStructure(roomName, {type: structure.type, pos: pos});
                                        while (res === ERR_INVALID_TARGET) {
                                            pos = getPosition().value;
                                            if (!pos) {
                                                break;
                                            }
                                            res = o.buildStructure(roomName, room.memory.buildQueue[0]);
                                        }
                                        if (res === OK) {
                                            room.memory.buildQueue.shift();
                                        } else {
                                            console.log(`cannot build: ${res}`);
                                        }
                                    }
                                } else {
                                    console.log('cannot locate position');
                                }
                            }
                        } else {
                            let res = o.buildStructure(roomName, structure);
                            if (res === OK) {
                                room.memory.buildQueue.shift();
                            } else {
                                console.log(`cannot build: ${res}`);
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
