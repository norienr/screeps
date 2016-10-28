var config = (function () {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';
    const ROLE_MINER = 'miner';

    const MIN_SAFE_DISTANCE = 5;
    const TOWER_ATTACK_INTERVAL = 5;

    const DYNAMIC_NUM = -1;

    /*
    const CREEPS = [
        {role: ROLE_HARVESTER, num: 2, parts: [WORK, CARRY, MOVE], priorityGeneration: 1},
        {role: ROLE_MINER, num: DYNAMIC_NUM, parts: [WORK, CARRY, MOVE], priorityGeneration: 2},
        {role: ROLE_BUILDER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 3},
        {role: ROLE_UPGRADER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 4},
        {role: ROLE_BUILDER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 5}
    ];
    */

    const CREEPS = [
        {role: ROLE_HARVESTER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 1},
        {role: ROLE_MINER, num: DYNAMIC_NUM,
            parts: [WORK, CARRY, MOVE], priorityGeneration: 2}
        //{role: ROLE_BUILDER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 3},
        //{role: ROLE_UPGRADER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 4},
        //{role: ROLE_BUILDER, num: 1, parts: [WORK, CARRY, MOVE], priorityGeneration: 5},

    ];

    const STRUCTURES = [ //highest priority at top
        //{type: STRUCTURE_ROAD}
    ];

    return {
        ROLE_HARVESTER: ROLE_HARVESTER,
        ROLE_UPGRADER: ROLE_UPGRADER,
        ROLE_BUILDER: ROLE_BUILDER,
        ROLE_MINER: ROLE_MINER,
        DYNAMIC_NUM: DYNAMIC_NUM,
        MIN_SAFE_DISTANCE: MIN_SAFE_DISTANCE,
        TOWER_ATTACK_INTERVAL: TOWER_ATTACK_INTERVAL,
        CREEPS: CREEPS,
        STRUCTURES: STRUCTURES
    };
})();

module.exports = config;
