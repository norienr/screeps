const Config = require('config');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleArcher = require('role.archer');
const roleMelee = require('role.melee');
let MODULE = require('minerControlModule');

MODULE = (function (module) {

    module.deleteUnusedNames = function () {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    };

    module.runCreeps = function (roomName) {
        _.forEach(Game.rooms[roomName].find(FIND_MY_CREEPS), (creep) => {
            if (creep.memory.saving) {
                const closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                creep.moveTo(closestSpawn);
            } else if (creep.memory.tempRole != undefined) {
                if (creep.memory.tempRole === Config.ROLE_HARVESTER) {
                    roleHarvester.run(creep);
                } else if (creep.memory.tempRole === Config.ROLE_UPGRADER) {
                    roleUpgrader.run(creep);
                } else if (creep.memory.tempRole === Config.ROLE_BUILDER) {
                    roleBuilder.run(creep);
                }
            } else {
                if (creep.memory.role === Config.ROLE_HARVESTER) {
                    roleHarvester.run(creep);
                } else if (creep.memory.role === Config.ROLE_UPGRADER) {
                    roleUpgrader.run(creep);
                } else if (creep.memory.role === Config.ROLE_BUILDER) {
                    roleBuilder.run(creep);
                } else if (creep.memory.role === Config.ROLE_MINER) {
                    module.initMiner(creep);
                } else if (creep.memory.role === Config.ROLE_TRANSPORTER) {
                    module.initTransporter(creep);
                } else if (creep.memory.role === Config.ROLE_ARCHER) {
                    roleArcher.run(creep);
                } else if (creep.memory.role === Config.ROLE_MELEE) {
                    roleMelee.run(creep);
                }
            }
        });
    };

    module.getCreepsByRole = function (roomName, role) {
        return _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
            creep => creep.memory.role === role);
    };

    module.getCreeps = function (roomName, role, generation) {
        return _.filter(module.getCreepsByRole(roomName, role),
            creep => creep.memory.priorityGeneration === generation);
    };

    module.getSpawnsByRoom = function (roomName) {
        return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES),
            struct => struct.structureType === STRUCTURE_SPAWN);
    };

    module.spawnCreeps = function (spawn, parts, role, generation) {
        var canSpawn = spawn.canCreateCreep(parts);
        if (canSpawn == OK) {
            spawn.createCreep(parts, undefined, {priorityGeneration: generation, role: role});
            spawn.memory.lastSpawningCreepMemory = {priorityGeneration: generation, role: role};
        }
        return canSpawn;
    };

    module.getNeededEnergy = function (parts) {
        let energy = 0;
        _.forEach(parts, (p) => {
            if (p === WORK) {
                energy += 100;
            } else if (p === CARRY) {
                energy += 50;
            } else if (p === MOVE) {
                energy += 50;
            } else { // not supported
                energy += 600;
            }
        });
        return energy;
    };

    module.getMissingCreepsNum = function (roomName, c) {
        const creepsAlive = module.getCreeps(roomName, c.role, c.priorityGeneration).length;
        const creepsInQueue = _.filter(Game.rooms[roomName].memory.spawnQueue,
            cr => cr.role === c.role && cr.priorityGeneration === c.priorityGeneration).length;
        const creepsSpawning = _.filter(module.getSpawnsByRoom(roomName),
            s => s.spawning != null && s.memory.lastSpawningCreepMemory.role === c.role &&
            s.memory.lastSpawningCreepMemory.priorityGeneration === c.priorityGeneration).length;

        let num;
        if (c.num === Config.DYNAMIC_SPAWN_NUM) {

            if (c.role === Config.ROLE_MINER) {
                num = _.filter(Game.rooms[roomName].find(FIND_SOURCES),
                    s => !module.hasHostilesAround(Game.rooms[roomName], s)).length;
            } else if (c.role === Config.ROLE_TRANSPORTER) {
                num = _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
                    s => s.memory.role === Config.ROLE_MINER).length;
            }

            if ((num - creepsAlive - creepsInQueue - creepsSpawning) > 0) {
                if (_.filter(Game.rooms[roomName].memory.spawnQueue,
                        c => c.role === Config.ROLE_MINER).length) {
                    return 0;
                } else {
                    return 1;
                }
            }

        } else {
            num = c.num;
        }

        return num - creepsAlive - creepsInQueue - creepsSpawning;
    };

    module.getCreepsToNormalRoles = function (roomName) {
        _.forEach(_.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), c => c.memory.tempRole != undefined),
            c => c.memory.tempRole = undefined);
    };

    module.run = function (roomName) {

        console.log(JSON.stringify(Game.rooms[roomName].memory.spawnQueue));

        module.deleteUnusedNames();

        module.runCreeps(roomName);

        if (Game.rooms[roomName].memory.spawnQueue === undefined) {
            Game.rooms[roomName].memory.spawnQueue = [];
        }

        const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);

        if (hostiles.length) {
            _.forEach(module.getCreepsByRole(roomName, Config.ROLE_MINER), function (m) {
                _.forEach(hostiles, function (threat) {
                    if (m.pos.getRangeTo(threat) < Config.MIN_SAFE_DISTANCE) {
                        m.memory.saving = true;
                    } else {
                        m.memory.saving = false;
                    }
                });
            });
        } else {
            _.forEach(module.getCreepsByRole(roomName, Config.ROLE_MINER), m => m.memory.saving = false);
        }

        _.forEach(Config.CREEPS, function (c) {
                const numToSpawn = module.getMissingCreepsNum(roomName, c);

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
            _.forEach(module.getSpawnsByRoom(roomName), function (s) {
                if (s.spawning == null && Game.rooms[roomName].memory.spawnQueue.length) {
                    const creep = Game.rooms[roomName].memory.spawnQueue[0];
                    const parts = creep.parts;
                    const availableEnergy = Game.rooms[roomName].energyAvailable -
                        module.getNeededEnergy(parts);
                    if (availableEnergy >= 100) {
                        parts.unshift(WORK);
                    }

                    if (module.spawnCreeps(s, parts, creep.role, creep.priorityGeneration) == OK) {
                        module.getCreepsToNormalRoles(roomName);
                        Game.rooms[roomName].memory.spawnQueue.shift();
                    } else { // reassign roles if can't spawn most valuable ones (harvester)
                        if (module.getCreepsByRole(roomName, Config.CREEPS[0].role).length < Config.CREEPS[0].num) {
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
    };

    return module;
})(MODULE);

module.exports = MODULE;
