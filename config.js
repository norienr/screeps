var config = (() => {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';
    const ROLE_MINER = 'miner';
    const ROLE_TRANSPORTER = 'transporter';
    const ROLE_COURIER = 'courier';
    const ROLE_ARCHER = 'archer';
    const ROLE_MELEE = 'melee';
    const ROLE_HEALER = 'healer';

    const MIN_SAFE_DISTANCE = 5;
    const TOWER_ATTACK_INTERVAL = 5;

    const DYNAMIC_SPAWN_NUM = -1;

    const CREEPS = [
        {
            role: ROLE_HARVESTER,
            num: 1,
            parts: [WORK, CARRY, MOVE, MOVE],
            priorityGeneration: 1
        },
        {
            role: ROLE_BUILDER,
            num: 2,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 2
        },
        {
            role: ROLE_MINER,
            num: DYNAMIC_SPAWN_NUM,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 3
        },
        {
            role: ROLE_UPGRADER,
            num: 1,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 4
        },
        {
            role: ROLE_TRANSPORTER,
            num: DYNAMIC_SPAWN_NUM,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 5
        },
        {
            role: ROLE_COURIER,
            num: 2,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 6
        }
    ];

    const STRUCTURES = [ //highest priority at top
        {type: STRUCTURE_CONTAINER, level: 2},
        {type: STRUCTURE_CONTAINER, level: 2},
        {type: STRUCTURE_EXTENSION},
        {type: STRUCTURE_EXTENSION},
        {type: STRUCTURE_EXTENSION},
        {type: STRUCTURE_TOWER}
    ];

    const DEFENSIVE_CREEPS = [
        {
            role: ROLE_ARCHER,
            num: 2,
            parts: [RANGED_ATTACK, MOVE],
            priorityGeneration: 1
        },
        {
            role: ROLE_HEALER,
            num: 1,
            parts: [HEAL, MOVE],
            priorityGeneration: 2
        },
        {
            role: ROLE_MELEE,
            num: DYNAMIC_SPAWN_NUM,
            parts: [TOUGH, ATTACK, ATTACK, ATTACK, MOVE],
            priorityGeneration: 3
        }
    ];

    return {
        ROLE_HARVESTER: ROLE_HARVESTER,
        ROLE_UPGRADER: ROLE_UPGRADER,
        ROLE_BUILDER: ROLE_BUILDER,
        ROLE_MINER: ROLE_MINER,
        ROLE_TRANSPORTER: ROLE_TRANSPORTER,
        ROLE_COURIER: ROLE_COURIER,
        ROLE_ARCHER: ROLE_ARCHER,
        ROLE_MELEE: ROLE_MELEE,
        ROLE_HEALER: ROLE_HEALER,
        DYNAMIC_SPAWN_NUM: DYNAMIC_SPAWN_NUM,
        MIN_SAFE_DISTANCE: MIN_SAFE_DISTANCE,
        TOWER_ATTACK_INTERVAL: TOWER_ATTACK_INTERVAL,
        CREEPS: CREEPS,
        DEFENSIVE_CREEPS: DEFENSIVE_CREEPS,
        STRUCTURES: STRUCTURES
    };
})();

module.exports = config;
