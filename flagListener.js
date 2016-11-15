const {squadsPropertyName, SQUAD_DEF, COLORS} = require('./squadsConfig');
const {action_types} = require('./storeProviderConfig');
const Squad = require('./squad');

const flagListener = (function () {
    let obj = {};
    let p = {};

    obj.init = function () {
        if (typeof Memory[squadsPropertyName] !== 'undefined') {
            return;
        }

        Memory[squadsPropertyName] = [];
    };

    p.addSquad = function (color, flag) {
        const squad = new Squad(color, [...SQUAD_DEF]);
        Memory[squadsPropertyName].push(squad);
        _.forEach(squad.squadUnits, unit => unit.squad = color);
        _.forEach(squad.squadUnits, unit => {
            const n = unit.num;
            delete unit.num;
            for (let i = 0; i < n; ++i) {
                flag.room.memory.spawnQueue.push(unit);
            }
        });

    };

    p.resolveAction = function (flagName, storeProvider) {
        const flag = Game.flags[flagName];

        const col = flag.secondaryColor;

        if (col === COLORS.SPAWN_COLOR) {
            p.addSquad(flag.color, flag);
            flag.memory.status = 'processed';

        } else if (col === COLORS.LOCATE_COLOR) {
            storeProvider.dispatch({
                type: action_types.MOVE_TO,
                actor: flag.color,
                payload: {pos: flag.pos}
            });
            flag.memory.status = 'processed';

        } else if (col === COLORS.ATTACK_COLOR) {
            storeProvider.dispatch({
                type: action_types.ATTACK,
                actor: flag.color,
                payload: {pos: flag.pos}
            });
            flag.memory.status = 'processed';

        } else if (col === COLORS.RETREAT_COLOR) {
            storeProvider.dispatch({
                type: action_types.RETREAT,
                actor: flag.color
            });
            flag.memory.status = 'processed';

        } else {
            // TODO
        }

    };

    obj.listen = function (storeProvider) {
        for (let flagName in Game.flags) {
            if (typeof Game.flags[flagName].memory.status !== 'undefined') {
                continue;
            }

            p.resolveAction(flagName, storeProvider);
        }
    };

    return obj;

})();

module.exports = flagListener;
