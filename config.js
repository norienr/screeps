var config = (function () {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';

    const CREEPS = [ //highest priority == lowest inQueue
        {role: ROLE_HARVESTER, num: 2, inQueue: 1},
        {role: ROLE_BUILDER, num: 1, inQueue: 2},
        {role: ROLE_UPGRADER, num: 1, inQueue: 3},
        {role: ROLE_BUILDER, num: 1, inQueue: 4}
    ];

    const STRUCTURES = [ //highest priority == lowest inQueue
        {type: STRUCTURE_ROAD, num: 1, inQueue: 1},
        {type: STRUCTURE_EXTENSION, num: 1, inQueue: 2}
    ];

    return {
        ROLE_HARVESTER: ROLE_HARVESTER,
        ROLE_UPGRADER: ROLE_UPGRADER,
        ROLE_BUILDER: ROLE_BUILDER,
        CREEPS: CREEPS,
        STRUCTURES: STRUCTURES
    };
})();

module.exports = config;