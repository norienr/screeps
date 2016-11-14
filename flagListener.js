const {memoryObject, squadsPropertyName, SQUAD_DEF, COLORS} = require('./squadsConfig');
const {action_types} = require('./storeProviderConfig');
const Squad = require('./squad');

const flagListener = (function () {
    let obj = {};
    let p = {};

    obj.init = function () {
        if (typeof memoryObject[squadsPropertyName] !== 'undefined') {
            return;
        }

        memoryObject[squadsPropertyName] = [];
    };

    p.addSquad = function (color, flag) {
        const squad = new Squad(color, [...SQUAD_DEF]);
        memoryObject[squadsPropertyName].push(squad);
        _.forEach(squad.squadUnits, unit => unit.squad = color);
        flag.room.memory.spawnQueue.push(...squad.squadUnits);
    };

    obj.listen = function (storeProvider) {
        for (let flagName in Game.flags) {
            if (typeof Game.flags[flagName].memory.status !== 'undefined') {
                continue;
            }

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
            } else {
                // TODO
            }
        }
    };

    return obj;

})();

module.exports = flagListener;
