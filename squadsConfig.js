const {ROLE_ARCHER, ROLE_HEALER, ROLE_MELEE} = require('./config');

module.exports = {
    squadsPropertyName: 'squads',
    COLORS: {
        SPAWN_COLOR: COLOR_YELLOW,
        LOCATE_COLOR: COLOR_GREEN,
        ATTACK_COLOR: COLOR_RED,
        RETREAT_COLOR: COLOR_WHITE
    },
    SQUAD_DEF: [
        {
            role: ROLE_ARCHER,
            num: 2,
            staticParts: [],
            dynamicParts: [RANGED_ATTACK, MOVE],
            pattern: [1, 1],
            limit: 50,
            priorityGeneration: 1
        },
        {
            role: ROLE_HEALER,
            num: 2,
            staticParts: [],
            dynamicParts: [HEAL, MOVE],
            pattern: [1, 1],
            limit: 50,
            priorityGeneration: 1
        },
        {
            role: ROLE_MELEE,
            num: 4,
            staticParts: [],
            dynamicParts: [ATTACK, MOVE],
            pattern: [1, 1],
            limit: 50,
            priorityGeneration: 1
        }
    ]
};
