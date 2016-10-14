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
        spawnCreepsInRoom(roomName, role, num) {
            _.forEach(this.getSpawnsByRoom(roomName), function (spawn) {
                if (num++) {
                    spawn.createCreep([WORK, CARRY, MOVE], undefined, {role: role});
                }
            });
        }
    };

    var publicAPI = {
        run: function () {

            o.runCreeps();

            o.deleteUnusedNames();

            for (let i in Game.rooms) {
                const roomName = Game.rooms[i].name;

                let harvesters = o.getCreepsByRole(roomName, ROLE_HARVESTER);
                let harvestersNeeded = MIN_HARVESTER_NUM - harvesters.length;
                if (harvestersNeeded) {
                    o.spawnCreepsInRoom(roomName, ROLE_HARVESTER, harvestersNeeded);
                } else { // only after we have enough harvesters
                    let upgraders = o.getCreepsByRole(roomName, ROLE_UPGRADER);
                    let upgradersNeeded = MIN_UPGRADER_NUM - upgraders.length;
                    if (upgradersNeeded) {
                        o.spawnCreepsInRoom(roomName, ROLE_UPGRADER, upgradersNeeded);
                    }

                    if (upgradersNeeded === 0) {
                        let builders = o.getCreepsByRole(roomName, ROLE_BUILDER);
                        let buildersNeeded = MIN_BUILDER_NUM - builders.length;
                        if (buildersNeeded) {
                            o.spawnCreepsInRoom(roomName, ROLE_BUILDER, buildersNeeded);
                        }
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = unitControlModule;