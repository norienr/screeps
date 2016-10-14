var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var unitControlModule = (function () {

    var o = {
        deleteUnusedNames: function () {
            for (let name in Memory.creeps) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log('Clearing non-existing creep memory:', name);
                }
            }
        },
        runCreeps: function () {
            for (let name in Game.creeps) {
                let creep = Game.creeps[name];
                if (creep.memory.role == 'harvester') {
                    roleHarvester.run(creep);
                }
                else if (creep.memory.role == 'upgrader') {
                    roleUpgrader.run(creep);
                }
                else if (creep.memory.role == 'builder') {
                    roleBuilder.run(creep);
                }
            }
        }
    };

    var publicAPI = {
        run: function () {

            o.runCreeps();

            o.deleteUnusedNames();

            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            console.log('Harvesters: ' + harvesters.length);

            if (harvesters.length < 2) {
                for (let i in Game.spawns) {
                    let newName = Game.spawns[i].createCreep([WORK, CARRY, MOVE], undefined, {role: 'harvester'});
                    console.log('Spawning new harvester: ' + newName);
                }
            } else { // only after we have enough harvesters
                var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
                console.log('Upgraders: ' + upgraders.length);
                if (upgraders.length < 1) {
                    for (let i in Game.spawns) {
                        let newName = Game.spawns[i].createCreep([WORK, CARRY, MOVE], undefined, {role: 'upgrader'});
                        console.log('Spawning new upgrader: ' + newName);
                    }
                }
            }
        }
    };

    return publicAPI;
})();

module.exports = unitControlModule;