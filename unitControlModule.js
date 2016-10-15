var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var unitControlModule = (function () {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';

    const MIN_HARVESTER_NUM = 2;
    const MIN_UPGRADER_NUM = 1;
    const MIN_BUILDER_NUM = 1;

    const CREEPS = [ //highest priority at top
        {role: ROLE_HARVESTER, needed: MIN_HARVESTER_NUM},
        {role: ROLE_UPGRADER, needed: MIN_UPGRADER_NUM},
        {role: ROLE_BUILDER, needed: MIN_BUILDER_NUM},
    ];


    var o = {
        deleteUnusedNames: function () {
            for (let name in Memory.creeps) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
        },
        runCreeps: function () {
            for (let name in Game.creeps) {
                let creep = Game.creeps[name];
                if (creep.memory.role == ROLE_HARVESTER) {
                    roleHarvester.run(creep);
                }
                else if (creep.memory.role == ROLE_UPGRADER) {
                    roleUpgrader.run(creep);
                }
                else if (creep.memory.role == ROLE_BUILDER) {
                    roleBuilder.run(creep);
                }
            }
        },
        getCreepsByRole: function (roomName, role) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_CREEPS), creep => creep.memory.role == role);
        },
        getSpawnsByRoom(roomName) {
            return _.filter(Game.rooms[roomName].find(FIND_MY_STRUCTURES), struct => struct.structureType == STRUCTURE_SPAWN);
        },
        spawnCreeps(spawn, parts, role) {
            var canSpawn = spawn.canCreateCreep(parts);
            if (canSpawn == OK) {
                spawn.createCreep(parts, undefined, {role: role});
                spawn.memory.lastSpawningRole = role;
            }
            return canSpawn;
        }
    };

    var publicAPI = {
            run: function (roomName) {
                o.runCreeps();

                o.deleteUnusedNames();

                if (Game.rooms[roomName].memory.spawnQueue === undefined) {
                    Game.rooms[roomName].memory.spawnQueue = [];
                }


                _.forEach(CREEPS, function (c) {
                        const creepsAlive = o.getCreepsByRole(roomName, c.role).length;
                        const creepsInQueue = _.filter(Game.rooms[roomName].memory.spawnQueue, x => x == c.role).length;
                        const creepsSpawning = _.filter(o.getSpawnsByRoom(roomName),
                            s => s.spawning != null && s.memory.lastSpawningRole == c.role
                        ).length;

                        const numToSpawn = c.needed - creepsAlive - creepsInQueue - creepsSpawning;

                        if (numToSpawn > 0) {
                            for (let i = 0; i < numToSpawn; ++i) {
                                Game.rooms[roomName].memory.spawnQueue.push(c.role);
                            }
                        }
                    }
                );
                console.log(`Build queue: ${Game.rooms[roomName].memory.spawnQueue}`);

                if (Game.rooms[roomName].memory.spawnQueue.length) {

                    _.forEach(o.getSpawnsByRoom(roomName), function (s) {
                        if (s.spawning == null && Game.rooms[roomName].memory.spawnQueue.length) { //can spawn
                            if (o.spawnCreeps(s, [WORK, CARRY, MOVE], Game.rooms[roomName].memory.spawnQueue[0]) == OK) {
                                Game.rooms[roomName].memory.spawnQueue.shift();
                            }
                        }
                    });
                }
            }
        }
        ;

    return publicAPI;
})
();

module.exports = unitControlModule;