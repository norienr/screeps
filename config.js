const config = (() => {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';
    const ROLE_MINER = 'miner';
    const ROLE_TRANSPORTER = 'transporter';
    const ROLE_COURIER = 'courier';
    const ROLE_ARCHER = 'archer';
    const ROLE_MELEE = 'melee';
    const ROLE_HEALER = 'healer';

    const MIN_TICKS_TO_RESPAWN = 30;

    const MIN_SAFE_DISTANCE = 5;
    const TOWER_ATTACK_INTERVAL = 5;

    const DYNAMIC_SPAWN_NUM = -1;

    const CREEPS = [
        {
            role: ROLE_HARVESTER,
            num: 1,
            parts: [WORK, CARRY, MOVE, MOVE],
            priorityGeneration: 0
        },
        {
            role: ROLE_BUILDER,
            num: 4,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 4
        },
        {
            role: ROLE_MINER,
            num: DYNAMIC_SPAWN_NUM,
            parts: [
                [MOVE, CARRY, WORK, WORK],
                [MOVE, CARRY, WORK, WORK, WORK],
                [MOVE, CARRY, WORK, WORK, WORK, WORK],
                [MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK],
                [MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK],
                [MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
                [MOVE, MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK]
            ],
            priorityGeneration: 3
        },
        {
            role: ROLE_UPGRADER,
            num: 1,
            parts: [WORK, WORK, CARRY, MOVE],
            priorityGeneration: 5
        },
        {
            role: ROLE_TRANSPORTER,
            num: DYNAMIC_SPAWN_NUM,
            parts: [], // will be added dynamically
            priorityGeneration: 2
        },
        {
            role: ROLE_COURIER,
            num: DYNAMIC_SPAWN_NUM,
            parts: [], // will be added dynamically
            priorityGeneration: 1
        }
    ];

    const CONTAINERS_POS_RADIUS = 3;
    const EXTENSIONS_POS_RADIUS = 10;
    const DEFAULT_POS_RADIUS = 3;

    const STRUCTURES = [];// Structure auto building is currently disabled, so it should not be used,
                          // though miners will still build its containers.

    const DEFENSIVE_CREEPS = [
        {
            role: ROLE_ARCHER,
            num: 2,
            parts: [RANGED_ATTACK, MOVE],
            assemble: true,
            priorityGeneration: 0
        },
        {
            role: ROLE_HEALER,
            num: 2,
            parts: [HEAL, MOVE],
            assemble: true,
            priorityGeneration: 0
        },
        {
            role: ROLE_MELEE,
            num: 4,
            parts: [ATTACK, MOVE],
            squad: true,
            priorityGeneration: 0
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
        MIN_TICKS_TO_RESPAWN: MIN_TICKS_TO_RESPAWN,
        CONTAINERS_POS_RADIUS: CONTAINERS_POS_RADIUS,
        EXTENSIONS_POS_RADIUS: EXTENSIONS_POS_RADIUS,
        DEFAULT_POS_RADIUS: DEFAULT_POS_RADIUS,
        CREEPS: CREEPS,
        DEFENSIVE_CREEPS: DEFENSIVE_CREEPS,
        STRUCTURES: STRUCTURES
    };
})();

module.exports = config;
