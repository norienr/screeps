var Config = require('config');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var unitControlModule = (function () {

    var o = {
        deleteUnusedNames: function () {
            for (let name in Memory.creeps) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
        },
        runCreeps: function (roomName) {
            _.forEach(Game.rooms[roomName].find(FIND_MY_CREEPS), function (creep) {
                if (creep.memory.saving) {
                    let spawns = _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
                        s => s.structureType == STRUCTURE_SPAWN);
                    const closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);

                    creep.moveTo(closestSpawn);

                } else if (creep.memory.tempRole != undefined) {
                    if (creep.memory.tempRole == Config.ROLE_HARVESTER) {
                        roleHarvester.run(creep);
                    }
                    else if (creep.memory.tempRole == Config.ROLE_UPGRADER) {
                        roleUpgrader.run(creep);
                    }
                    else if (creep.memory.tempRole == Config.ROLE_BUILDER) {
                        roleBuilder.run(creep);
                    }
                }
                else if (creep.memory.role == Config.ROLE_HARVESTER) {
                    roleHarvester.run(creep);
                }
                else if (creep.memory.role == Config.ROLE_UPGRADER) {
                    roleUpgrader.run(creep);
                }
                else if (creep.memory.role == Config.ROLE_BUILDER) {
                    roleBuilder.run(creep);
                }

            });
        },
        getCreepsByRole: function (roomName, role) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), creep => creep.memory.role == role);
        },
        getCreeps: function (roomName, role, generation) {
            return _.filter(this.getCreepsByRole(roomName, role), creep => creep.memory.generation == generation);
        },
        getSpawnsByRoom: function (roomName) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES), struct => struct.structureType == STRUCTURE_SPAWN);
        },
        spawnCreeps: function (spawn, parts, role, generation) {
            var canSpawn = spawn.canCreateCreep(parts);
            if (canSpawn == OK) {
                spawn.createCreep(parts, undefined, {generation: generation, role: role});
                spawn.memory.lastSpawningCreepMemory = {generation: generation, role: role};
            }
            return canSpawn;
        },
        getMissingCreepsNum: function (roomName, c) {
            const creepsAlive = this.getCreeps(roomName, c.role, c.generation).length;
            const creepsInQueue = _.filter(Game.rooms[roomName].memory.spawnQueue,
                cr => cr.role == c.role && cr.generation == c.generation).length;
            const creepsSpawning = _.filter(this.getSpawnsByRoom(roomName),
                s => s.spawning != null && s.memory.lastSpawningCreepMemory.role == c.role &&
                s.memory.lastSpawningCreepMemory.generation == c.generation).length;
            return c.num - creepsAlive - creepsInQueue - creepsSpawning;
        },
        getCreepsToNormalRoles: function (roomName) {
            _.forEach(_.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), c => c.memory.tempRole != undefined),
                c => c.memory.tempRole = undefined);
        }
    };

    var publicAPI = {
        run: function (roomName) {

            o.deleteUnusedNames();

            o.runCreeps(roomName);


            if (Game.rooms[roomName].memory.spawnQueue === undefined) {
                Game.rooms[roomName].memory.spawnQueue = [];
            }

            const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);

            if (hostiles.length) {
                _.forEach(o.getCreepsByRole(roomName, Config.ROLE_HARVESTER), function (harv) {
                    _.forEach(hostiles, function (threat) {
                        if (harv.pos.getRangeTo(threat) < Config.MIN_SAFE_DISTANCE) {
                            harv.memory.saving = true;
                        } else {
                            harv.memory.saving = false;
                        }
                    });
                });
            } else {
                _.forEach(o.getCreepsByRole(roomName, Config.ROLE_HARVESTER), harv => harv.memory.saving = false);
            }

            _.forEach(Config.CREEPS, function (c) {
                    const numToSpawn = o.getMissingCreepsNum(roomName, c);

                    if (numToSpawn > 0) {
                        for (let i = 0; i < numToSpawn; ++i) {
                            Game.rooms[roomName].memory.spawnQueue.push({role: c.role, generation: c.generation});
                        }
                    }
                }
            );

            if (Game.rooms[roomName].memory.spawnQueue.length) {
                Game.rooms[roomName].memory.spawnQueue =
                    _.sortBy(Game.rooms[roomName].memory.spawnQueue, 'generation');
                _.forEach(o.getSpawnsByRoom(roomName), function (s) {
                    if (s.spawning == null && Game.rooms[roomName].memory.spawnQueue.length) {
                        const creep = Game.rooms[roomName].memory.spawnQueue[0];
                        if (o.spawnCreeps(s, [WORK, CARRY, MOVE], creep.role, creep.generation) == OK) {
                            o.getCreepsToNormalRoles(roomName);
                            Game.rooms[roomName].memory.spawnQueue.shift();
                        } else { // reassign roles if can't spawn most valuable ones (harvester)
                            if (o.getCreepsByRole(roomName, Config.CREEPS[0].role).length < Config.CREEPS[0].num) {
                                const availableCreeps = _.sortBy(
                                    _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), c => c.memory.tempRole == undefined),
                                    'generation'
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
})
();

module.exports = unitControlModule;