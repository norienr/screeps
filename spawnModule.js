var spawnModule = {
    run: function () {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

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

module.exports = spawnModule;