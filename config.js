var config = (function () {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';

    const MIN_SAFE_DISTANCE = 5;

    const CREEPS = [ //highest priority == lowest generation
        {role: ROLE_HARVESTER, num: 2, generation: 1},
        {role: ROLE_BUILDER, num: 1, generation: 2},
        {role: ROLE_UPGRADER, num: 1, generation: 3},
        {role: ROLE_BUILDER, num: 1, generation: 4}
    ];

    const STRUCTURES = [ //highest priority at top
        STRUCTURE_ROAD,
        STRUCTURE_EXTENSION
    ];

    return {
        ROLE_HARVESTER: ROLE_HARVESTER,
        ROLE_UPGRADER: ROLE_UPGRADER,
        ROLE_BUILDER: ROLE_BUILDER,
        MIN_SAFE_DISTANCE: MIN_SAFE_DISTANCE,
        CREEPS: CREEPS,
        STRUCTURES: STRUCTURES
    };
})();

module.exports = config;