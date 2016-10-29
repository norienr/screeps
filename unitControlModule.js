const Config = require('config');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleMiner = require('role.miner');

const unitControlModule = (function () {

    function deleteUnusedNames() {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }

    function runCreeps(roomName) {
        _.forEach(Game.rooms[roomName].find(FIND_MY_CREEPS), (creep) => {
            if (creep.memory.saving) {
                const closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);

                creep.moveTo(closestSpawn);

            } else if (creep.memory.tempRole != undefined) {
                if (creep.memory.tempRole == Config.ROLE_HARVESTER) {
                    roleHarvester.run(creep);
                } else if (creep.memory.tempRole == Config.ROLE_UPGRADER) {
                    roleUpgrader.run(creep);
                } else if (creep.memory.tempRole == Config.ROLE_BUILDER) {
                    roleBuilder.run(creep);
                }
            } else {
                if (creep.memory.role == Config.ROLE_HARVESTER) {
                    roleHarvester.run(creep);
                } else if (creep.memory.role == Config.ROLE_UPGRADER) {
                    roleUpgrader.run(creep);
                } else if (creep.memory.role == Config.ROLE_BUILDER) {
                    roleBuilder.run(creep);
                } else if (creep.memory.role == Config.ROLE_MINER) {
                    initMiner(creep);
                }
            }
        });
    }

    function locateContainerPos(room, source) {
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
    }

    function hasMinerAssigned(room, source) {
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role == Config.ROLE_MINER &&
            creep.memory.sourceId != undefined &&
            Game.getObjectById(creep.memory.sourceId).pos == source.pos).length;
    }

    function findUnassignedSource(room, creep) {
        const srcs = _.filter(room.find(FIND_SOURCES),
            src => !hasMinerAssigned(room, src));
        return creep.pos.findClosestByRange(srcs);
    }

    function initMiner(creep) {
        const room = creep.room;
        if (room.memory.containers === undefined) {
            room.memory.containers = [];
        }

        if (creep.memory.sourceId === undefined) {
            const src = findUnassignedSource(room, creep);
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
                    const container = locateContainerPos(room, src);
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
    }

    function getCreepsByRole(roomName, role) {
        return _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
            creep => creep.memory.role == role);
    }

    function getCreeps(roomName, role, generation) {
        return _.filter(getCreepsByRole(roomName, role),
            creep => creep.memory.priorityGeneration == generation);
    }

    function getSpawnsByRoom(roomName) {
        return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
            struct => struct.structureType == STRUCTURE_SPAWN);
    }

    function spawnCreeps(spawn, parts, role, generation) {
        var canSpawn = spawn.canCreateCreep(parts);
        if (canSpawn == OK) {
            spawn.createCreep(parts, undefined, {priorityGeneration: generation, role: role});
            spawn.memory.lastSpawningCreepMemory = {priorityGeneration: generation, role: role};
        }
        return canSpawn;
    }

    function getMissingCreepsNum(roomName, c) {
        const creepsAlive = getCreeps(roomName, c.role, c.priorityGeneration).length;
        const creepsInQueue = _.filter(Game.rooms[roomName].memory.spawnQueue,
            cr => cr.role === c.role && cr.priorityGeneration === c.priorityGeneration).length;
        const creepsSpawning = _.filter(getSpawnsByRoom(roomName),
            s => s.spawning != null && s.memory.lastSpawningCreepMemory.role === c.role &&
            s.memory.lastSpawningCreepMemory.priorityGeneration === c.priorityGeneration).length;

        let num;
        if (c.num === Config.DYNAMIC_NUM) {
            if (c.role === Config.ROLE_MINER) {
                num = Game.rooms[roomName].find(FIND_SOURCES).length;
            }
        } else {
            num = c.num;
        }

        return num - creepsAlive - creepsInQueue - creepsSpawning;
    }

    function getCreepsToNormalRoles(roomName) {
        _.forEach(_.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), c => c.memory.tempRole != undefined),
            c => c.memory.tempRole = undefined);
    }


    const publicAPI = {
        run: function (roomName) {

            deleteUnusedNames();

            runCreeps(roomName);

            if (Game.rooms[roomName].memory.spawnQueue === undefined) {
                Game.rooms[roomName].memory.spawnQueue = [];
            }

            const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);

            if (hostiles.length) {
                _.forEach(getCreepsByRole(roomName, Config.ROLE_HARVESTER), function (harv) {
                    _.forEach(hostiles, function (threat) {
                        if (harv.pos.getRangeTo(threat) < Config.MIN_SAFE_DISTANCE) {
                            harv.memory.saving = true;
                        } else {
                            harv.memory.saving = false;
                        }
                    });
                });
            } else {
                _.forEach(getCreepsByRole(roomName, Config.ROLE_HARVESTER), harv => harv.memory.saving = false);
            }

            _.forEach(Config.CREEPS, function (c) {
                    const numToSpawn = getMissingCreepsNum(roomName, c);

                    if (numToSpawn > 0) {
                        for (let i = 0; i < numToSpawn; ++i) {
                            Game.rooms[roomName].memory.spawnQueue.push({
                                role: c.role,
                                parts: c.parts,
                                priorityGeneration: c.priorityGeneration
                            });
                        }
                    }
                }
            );

            if (Game.rooms[roomName].memory.spawnQueue.length) {
                Game.rooms[roomName].memory.spawnQueue =
                    _.sortBy(Game.rooms[roomName].memory.spawnQueue, 'priorityGeneration');
                _.forEach(getSpawnsByRoom(roomName), function (s) {
                    if (s.spawning == null && Game.rooms[roomName].memory.spawnQueue.length) {
                        const creep = Game.rooms[roomName].memory.spawnQueue[0];
                        if (spawnCreeps(s, creep.parts, creep.role, creep.priorityGeneration) == OK) {
                            getCreepsToNormalRoles(roomName);
                            Game.rooms[roomName].memory.spawnQueue.shift();
                        } else { // reassign roles if can't spawn most valuable ones (harvester)
                            if (getCreepsByRole(roomName, Config.CREEPS[0].role).length < Config.CREEPS[0].num) {
                                const availableCreeps = _.sortBy(
                                    _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
                                        c => c.memory.tempRole === undefined),
                                    'priorityGeneration'
                                );

                                for (let i = 0, num = Config.CREEPS[0].num, aNum = availableCreeps.length;
                                     i < num && i < aNum; ++i) {
                                    availableCreeps[i].memory.tempRole = Config.ROLE_HARVESTER;
                                }
                            }
                        }
                    }
                });
            }
        }
    };

    return publicAPI;
})();

module.exports = unitControlModule;
