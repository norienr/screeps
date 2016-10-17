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
                if (creep.memory.role == Config.ROLE_HARVESTER) {
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
        getSpawnsByRoom: function (roomName) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES), struct => struct.structureType == STRUCTURE_SPAWN);
        },
        spawnCreeps: function (spawn, parts, role) {
            var canSpawn = spawn.canCreateCreep(parts);
            if (canSpawn == OK) {
                spawn.createCreep(parts, undefined, {role: role});
                spawn.memory.lastSpawningRole = role;
            }
            return canSpawn;
        },
        getCreepQueueValue: function (role) {
            return _.filter(CREEPS, c => c.role == role)[0].inQueue;
        }
    };

    var publicAPI = {
        run: function (roomName) {

            o.deleteUnusedNames();

            o.runCreeps(roomName);


            if (Game.rooms[roomName].memory.spawnQueue === undefined) {
                Game.rooms[roomName].memory.spawnQueue = [];
            }


            _.forEach(Config.CREEPS, function (c) {
                    const creepsAlive = o.getCreepsByRole(roomName, c.role).length;
                    const creepsInQueue = _.filter(Game.rooms[roomName].memory.spawnQueue, x => x == c.role).length;
                    const creepsSpawning = _.filter(o.getSpawnsByRoom(roomName),
                        s => s.spawning != null && s.memory.lastSpawningRole == c.role
                    ).length;

                    const numToSpawn = c.num - creepsAlive - creepsInQueue - creepsSpawning;

                    if (numToSpawn > 0) {
                        for (let i = 0; i < numToSpawn; ++i) {
                            Game.rooms[roomName].memory.spawnQueue.push(c.role);
                        }
                    }
                }
            );

            if (Game.rooms[roomName].memory.spawnQueue.length) {

                Game.rooms[roomName].memory.spawnQueue =
                    _.sortBy(Game.rooms[roomName].memory.spawnQueue, r => o.getCreepQueueValue(r));

                _.forEach(o.getSpawnsByRoom(roomName), function (s) {
                    if (s.spawning == null && Game.rooms[roomName].memory.spawnQueue.length) { //can spawn
                        if (o.spawnCreeps(s, [WORK, CARRY, MOVE], Game.rooms[roomName].memory.spawnQueue[0]) == OK) {
                            Game.rooms[roomName].memory.spawnQueue.shift();
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