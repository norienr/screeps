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
            parts: [RANGED_ATTACK, MOVE],
            priorityGeneration: 1
        },
        {
            role: ROLE_HEALER,
            num: 2,
            parts: [HEAL, MOVE],
            priorityGeneration: 1
        },
        {
            role: ROLE_MELEE,
            num: 4,
            parts: [TOUGH, ATTACK, ATTACK, ATTACK, MOVE],
            priorityGeneration: 1
        }
    ]
};
