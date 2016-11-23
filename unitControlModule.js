const Config = require('config');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleTransporter = require('role.transporter');
const roleCourier = require('role.courier');
const roleArcher = require('role.archer');
const roleMelee = require('role.melee');
const roleHealer = require('role.healer');
let MODULE = require('minerControlModule');

MODULE = (function (module) {

    module.deleteUnusedNames = function () {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    };

    module.runCreeps = function (room) {
        _.forEach(room.find(FIND_MY_CREEPS), (creep) => {
                if (creep.memory.saving) {
                    const closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                    creep.moveTo(closestSpawn);
                } else if (typeof creep.memory.tempRole !== 'undefined') {
                    if (creep.memory.tempRole === Config.ROLE_HARVESTER) {
                        roleHarvester.run(creep);
                    } else if (creep.memory.tempRole === Config.ROLE_UPGRADER) {
                        roleUpgrader.run(creep);
                    } else if (creep.memory.tempRole === Config.ROLE_BUILDER) {
                        roleBuilder.run(creep);
                    } else if (creep.memory.tempRole === Config.ROLE_TRANSPORTER) {
                        roleTransporter.run(creep);
                    } else if (creep.memory.tempRole === Config.ROLE_COURIER) {
                        roleCourier.run(creep);
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
                        roleTransporter.run(creep);
                    } else if (creep.memory.role === Config.ROLE_COURIER) {
                        roleCourier.run(creep);
                    } else if (creep.memory.role === Config.ROLE_ARCHER) {
                        roleArcher.run(creep);
                    } else if (creep.memory.role === Config.ROLE_MELEE) {
                        roleMelee.run(creep);
                    } else if (creep.memory.role === Config.ROLE_HEALER) {
                        roleHealer.run(creep);
                    }
                }
            }
        );
    };

    module.getCreepsByRole = function (room, role) {
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role === role);
    };

    module.getCreeps = function (room, role, generation) {
        return _.filter(module.getCreepsByRole(room, role),
            creep => creep.memory.priorityGeneration === generation);
    };

    module.getSpawnsByRoom = function (room) {
        return _.filter(room.find(FIND_MY_STRUCTURES),
            struct => struct.structureType === STRUCTURE_SPAWN);
    };

    module.spawnCreeps = function (spawn, creep) {
        const role = creep.role;
        const generation = creep.priorityGeneration;
        const parts = creep.parts;
        const assemble = creep.assemble;
        const squad = creep.squad;

        const canSpawn = spawn.canCreateCreep(parts);
        if (canSpawn === OK) {
            spawn.createCreep(parts, undefined, {
                priorityGeneration: generation,
                role: role,
                assemble: assemble,
                squad: squad
            });
            spawn.memory.lastSpawningCreepMemory = {priorityGeneration: generation, role: role};
        }
        return canSpawn;
    };

    module.getNeededEnergy = function (parts) {
        let energy = 0;
        _.forEach(parts, p => energy += BODYPART_COST[WORK]);
        return energy;
    };

    module.getMissingCreepsNum = function (room, c) {
        const creepsAlive = _.filter(module.getCreeps(room, c.role, c.priorityGeneration),
            c => c.ticksToLive > Config.MIN_TICKS_TO_RESPAWN).length;
        const creepsInQueue = _.filter(room.memory.spawnQueue,
            cr => cr.role === c.role && cr.priorityGeneration === c.priorityGeneration).length;
        const creepsSpawning = _.filter(module.getSpawnsByRoom(room),
            s => s.spawning != null && s.memory.lastSpawningCreepMemory.role === c.role &&
            s.memory.lastSpawningCreepMemory.priorityGeneration === c.priorityGeneration).length;

        let num;
        if (c.num === Config.DYNAMIC_SPAWN_NUM) {
            if (c.role === Config.ROLE_MINER) {
                num = _.filter(room.find(FIND_SOURCES),
                    s => !module.hasHostilesAround(room, s)).length;
            } else if (c.role === Config.ROLE_TRANSPORTER) {
                num = _.filter(room.find(FIND_STRUCTURES),
                    s => (s.structureType === STRUCTURE_CONTAINER ||
                    s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) &&
                    _.filter(room.memory.containers, x => x.containerId === s.id).length === 0).length;
                if (num > 0) {
                    num += _.filter(room.find(FIND_STRUCTURES),
                        s => s.structureType === STRUCTURE_CONTAINER &&
                        _.filter(room.memory.containers, x => x.containerId === s.id).length).length;
                }
            } else if (c.role === Config.ROLE_COURIER) {
                num = 2 * _.filter(room.find(FIND_STRUCTURES),
                        s => (s.structureType === STRUCTURE_CONTAINER ||
                        s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) &&
                        _.filter(room.memory.containers, x => x.containerId === s.id).length === 0).length;
            }

            if ((num - creepsAlive - creepsInQueue - creepsSpawning) > 0) {
                if (_.filter(room.memory.spawnQueue,
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

    module.assembleSquad = function (room) {
        const flags = room.find(FIND_FLAGS);
        if (flags.length) {
            const squadUnits = _.filter(room.find(FIND_MY_CREEPS),
                creep => creep.memory.assemble === true);
            if (squadUnits.length) {
                _.forEach(squadUnits, u => u.moveTo(flags[0]));
            }
        }
    };

    module.getCreepsToNormalRoles = function (room) {
        _.forEach(_.filter(room.find(FIND_MY_CREEPS), c => typeof c.memory.tempRole !== 'undefined'),
            c => c.memory.tempRole = undefined);
    };

    module.run = function (roomName) {

        const room = Game.rooms[roomName];

        console.log(JSON.stringify(room.memory.spawnQueue));

        module.deleteUnusedNames();

        module.runCreeps(room);

        if (typeof room.memory.spawnQueue === 'undefined') {
            room.memory.spawnQueue = [];
        }

        if (room.memory.underAttack) {
            const hostiles = room.find(FIND_HOSTILE_CREEPS);
            _.forEach(module.getCreepsByRole(room, Config.ROLE_MINER), function (m) {
                _.forEach(hostiles, function (threat) {
                    if (m.pos.getRangeTo(threat) < Config.MIN_SAFE_DISTANCE) {
                        m.memory.saving = true;
                    } else {
                        m.memory.saving = false;
                    }
                });
            });
        } else {
            _.forEach(module.getCreepsByRole(room, Config.ROLE_MINER), m => m.memory.saving = false);
        }

        let creepsToSpawn = [...Config.CREEPS];
        if (room.memory.underAttack) {
            creepsToSpawn.unshift(...Config.DEFENSIVE_CREEPS);
        } else {
            module.assembleSquad(room);
        }

        _.forEach(creepsToSpawn, function (creep) {
                const numToSpawn = module.getMissingCreepsNum(room, creep);
                for (let i = 0; i < numToSpawn; ++i) {
                    room.memory.spawnQueue.push(Object.assign({}, creep));
                }
            }
        );

        if (room.memory.spawnQueue.length) {
            room.memory.spawnQueue =
                _.sortBy(room.memory.spawnQueue, 'priorityGeneration');
            const spawns = module.getSpawnsByRoom(room);
            _.forEach(spawns, function (s) {
                if (!s.spawning && typeof s.spawning === 'object') {

                    const creep = room.memory.spawnQueue[0];

                    const partsBlock = [];

                    for (let i = 0, n = creep.dynamicParts.length; i < n; ++i) {
                        for (let j = 0; j < creep.pattern[i]; ++i) {
                            partsBlock.push(creep.dynamicParts[i]);
                        }
                    }

                    const num = ((room.energyAvailable - module.getNeededEnergy(creep.staticParts)) /
                        module.getNeededEnergy(partsBlock)) >> 0;

                    creep.parts = [];
                    creep.parts.push(...creep.staticParts);

                    for (let i = 0; i < num; ++i) {
                        if (creep.parts.length > creep.limit - partsBlock.length) {
                            break;
                        }

                        creep.parts.push(...partsBlock);
                    }

                    let res = module.spawnCreeps(s, creep);
                    if (res === OK) {
                        module.getCreepsToNormalRoles(room);
                        room.memory.spawnQueue.shift();
                    } else { // reassign roles if can't spawn most valuable ones (harvester)
                        if (res === -6) {
                            room.memory.spawnQueue.shift();
                        }

                        if (module.getCreepsByRole(room, Config.ROLE_HARVESTER).length < 1) {
                            const availableCreeps = _.sortBy(_.filter(room.find(FIND_MY_CREEPS),
                                c => typeof c.memory.tempRole === 'undefined'),
                                'priorityGeneration'
                            );

                            availableCreeps.reverse();

                            if (availableCreeps.length) {
                                availableCreeps[0].memory.tempRole = Config.ROLE_HARVESTER;
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
