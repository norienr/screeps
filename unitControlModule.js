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

    module.runCreeps = function (roomName) {
        _.forEach(Game.rooms[roomName].find(FIND_MY_CREEPS), (creep) => {
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

    module.spawnCreeps = function (spawn, creep) {
        const role = creep.role;
        const generation = creep.priorityGeneration;
        const parts = creep.parts;
        const assemble = creep.assemble || false;
        const squad = creep.squad;

        var canSpawn = spawn.canCreateCreep(parts);
        if (canSpawn === OK) {
            spawn.createCreep(parts, undefined, {
                priorityGeneration: generation,
                role: role,
                assemble: assemble,
                squad: squad
            });
            spawn.memory.lastSpawningCreepMemory = {priorityGeneration: generation, role: role};
        } else {
            console.log(`Cannot spawn creep: ${canSpawn}`);
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
            } else if (p === ATTACK) {
                energy += 80;
            } else if (p === RANGED_ATTACK) {
                energy += 150;
            } else if (p === HEAL) {
                energy += 250;
            } else if (p === TOUGH) {
                energy += 50;
            } else { // not supported
                energy += 600;
            }
        });
        return energy;
    };

    module.getMissingCreepsNum = function (roomName, c) {
        const creepsAlive = _.filter(module.getCreeps(roomName, c.role, c.priorityGeneration),
            c => c.ticksToLive > Config.MIN_TICKS_TO_RESPAWN).length;
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
                num = _.filter(Game.rooms[roomName].find(FIND_STRUCTURES),
                    s => (s.structureType === STRUCTURE_CONTAINER ||
                    s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) &&
                    _.filter(Game.rooms[roomName].memory.containers, x => x.containerId === s.id).length === 0).length;
                if (num > 0) {
                    num += _.filter(Game.rooms[roomName].find(FIND_STRUCTURES),
                        s => s.structureType === STRUCTURE_CONTAINER &&
                        _.filter(Game.rooms[roomName].memory.containers, x => x.containerId === s.id).length).length;
                }
            } else if (c.role === Config.ROLE_COURIER) {
                num = 2 * _.filter(Game.rooms[roomName].find(FIND_STRUCTURES),
                        s => (s.structureType === STRUCTURE_CONTAINER ||
                        s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) &&
                        _.filter(Game.rooms[roomName].memory.containers, x => x.containerId === s.id).length === 0).length;
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

    module.assembleSquad = function (roomName) {
        const flags = Game.rooms[roomName].find(FIND_FLAGS);
        if (flags.length) {
            const squadUnits = _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
                creep => creep.memory.assemble === true);
            if (squadUnits.length) {
                _.forEach(squadUnits, u => u.moveTo(flags[0]));
            }
        }
    };

    module.getCreepsToNormalRoles = function (roomName) {
        _.forEach(_.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), c => typeof c.memory.tempRole !== 'undefined'),
            c => c.memory.tempRole = undefined);
    };

    module.run = function (roomName) {

        module.deleteUnusedNames();

        module.runCreeps(roomName);

        if (typeof Game.rooms[roomName].memory.spawnQueue === 'undefined') {
            Game.rooms[roomName].memory.spawnQueue = [];
        }

        console.log(JSON.stringify(Game.rooms[roomName].memory.spawnQueue));

        if (Game.rooms[roomName].memory.underAttack) {
            const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
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

        let creepsToSpawn = [...Config.CREEPS];
        if (Game.rooms[roomName].memory.underAttack) {
            creepsToSpawn.unshift(...Config.DEFENSIVE_CREEPS);
        } else { // assemble defense units
            module.assembleSquad(roomName);
        }

        _.forEach(creepsToSpawn, function (c) {
                const numToSpawn = module.getMissingCreepsNum(roomName, c);

                if (numToSpawn > 0) {
                    for (let i = 0; i < numToSpawn; ++i) {
                        Game.rooms[roomName].memory.spawnQueue.push({
                            role: c.role,
                            parts: c.parts,
                            priorityGeneration: c.priorityGeneration,
                            assemble: c.assemble
                        });
                    }
                }
            }
        );

        if (Game.rooms[roomName].memory.spawnQueue.length) {
            Game.rooms[roomName].memory.spawnQueue =
                _.sortBy(Game.rooms[roomName].memory.spawnQueue, 'priorityGeneration');
            _.forEach(module.getSpawnsByRoom(roomName), function (s) {
                if (!s.spawning && typeof s.spawning === 'object' && Game.rooms[roomName].memory.spawnQueue.length) {
                    const creep = Game.rooms[roomName].memory.spawnQueue[0];
                    const parts = [...creep.parts];
                    parts.reverse();
                    if (creep.role === Config.ROLE_MINER) {
                        for (let i in parts) {
                            let availableEnergy = Game.rooms[roomName].energyAvailable -
                                module.getNeededEnergy(parts[i]);
                            if (!(availableEnergy < 0)) {
                                creep.parts = parts[i];
                                break;
                            }
                        }
                    } else if (creep.role === Config.ROLE_COURIER || creep.role === Config.ROLE_TRANSPORTER) {
                        const pattern = [CARRY, CARRY, MOVE];

                        const num = (Game.rooms[roomName].energyAvailable /
                            module.getNeededEnergy(pattern)) >> 0;

                        creep.parts = [];

                        for (let i = 0; i < num; ++i) {
                            if (creep.parts.length > 50 - pattern.length) {
                                break;
                            }

                            creep.parts.push(...pattern);
                        }

                    } else if (creep.role === Config.ROLE_MELEE) {
                        let availableEnergy = Game.rooms[roomName].energyAvailable -
                            (module.getNeededEnergy(parts));

                        while (availableEnergy >= module.getNeededEnergy([ATTACK, MOVE]) && parts.length < 50) {
                            parts.push(ATTACK);
                            parts.unshift(MOVE);
                        }

                    } else if (creep.role === Config.ROLE_ARCHER) {
                        let availableEnergy = Game.rooms[roomName].energyAvailable -
                            (module.getNeededEnergy(parts));
                        while (availableEnergy >= module.getNeededEnergy([RANGED_ATTACK, MOVE]) && parts.length < 50) {
                            parts.push(RANGED_ATTACK);
                            parts.unshift(MOVE);
                        }

                    } else if (creep.role === Config.ROLE_HEALER) {
                        let availableEnergy = Game.rooms[roomName].energyAvailable -
                            (module.getNeededEnergy(parts));
                        while (availableEnergy >= module.getNeededEnergy([HEAL, MOVE]) && parts.length < 50) {
                            parts.push(HEAL);
                            parts.unshift(MOVE);
                        }
                    }

                    let res = module.spawnCreeps(s, creep);
                    if (res === OK) {
                        module.getCreepsToNormalRoles(roomName);
                        Game.rooms[roomName].memory.spawnQueue.shift();
                    } else { // reassign roles if can't spawn most valuable ones (courier)
                        if (res === -6) {
                            Game.rooms[roomName].memory.spawnQueue.shift();
                        }
                        if (module.getCreepsByRole(roomName, Config.ROLE_COURIER).length < 1) {
                            const availableCreeps = _.sortBy(
                                _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS),
                                    c => typeof c.memory.tempRole === 'undefined'),
                                'priorityGeneration'
                            );

                            availableCreeps.reverse();

                            for (let i = 0, num = 1, aNum = availableCreeps.length;
                                 i < num && i < aNum; ++i) {
                                availableCreeps[i].memory.tempRole = Config.ROLE_COURIER;
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
