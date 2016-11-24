/**
 * To start remote mining you need to
 * create flag called e.g 'Colonize1'
 * on the source in another room
 */
const remoteMiningControlModule = {
    run:() => {
        for (let flagName in Game.flags) {
            let flag = Game.flags[flagName];
            if(flagName.match(/Colonize\d+/)){
                if(!flag.memory.assignedMiner){
                    const spawn = _.sample(Game.spawns);
                    flag.memory.assignedMiner = spawn.createCreep(
                        [MOVE, WORK, MOVE, CARRY], null, {role: 'remoteMiner', flag: flag.name });
                    if(flag.memory.assignedMiner === -6){
                        delete flag.memory.assignedMiner;
                    }
                }
                if(!Game.creeps[flag.memory.assignedMiner]){
                    delete flag.memory.assignedMiner;
                }
                if(flag.memory.assignedMiner){
                    if(!Game.getObjectById(flag.memory.container)){
                        let container = flag.pos.findInRange(FIND_STRUCTURES, 1,
                            {filter: function (structure) {
                                return (structure.structureType == STRUCTURE_CONTAINER);}});
                        if(container.length){
                            flag.memory.container = container[0].id;
                        }
                    }
                }
                if(flag.memory.container && flag.memory.assignedMiner && !flag.memory.assignedTransporter){
                    const spawn = _.sample(Game.spawns);
                    flag.memory.assignedTransporter = spawn.createCreep(
                        [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], null, {role: 'remoteTransporter', flag: flag.name });
                }
                if(!Game.creeps[flag.memory.assignedTransporter]){
                    delete flag.memory.assignedTransporter;
                }
            }
        }
    }
};

module.exports = remoteMiningControlModule;