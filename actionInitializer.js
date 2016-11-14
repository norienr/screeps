const {action_types} = require('./storeProviderConfig');

let actionInitializer = (function () {
    let obj = {};

    /**
     * Binds initializer to an action store.
     * @param storeProvider Action store to bind to.
     */
    obj.bind = function (storeProvider) {
        const state = storeProvider.getState();
        _.forEach(state, s => {
            if (s.type === action_types.MOVE_TO) {
                if (Game.cpu.tickLimit - Game.cpu.getUsed() > 50) {
                    const squad = [];
                    for (let creepName in Game.creeps) {
                        if (Game.creeps[creepName].memory.squad === s.actor) {
                            Game.creeps[creepName].moveTo(
                                new RoomPosition(s.payload.pos.x, s.payload.pos.y, s.payload.pos.roomName));
                        }
                    }
                } else {
                    console.log('ERR: CPU is too low to perform squad operations.');
                }
            }
        });
    };

    return obj;

})();

module.exports = actionInitializer;
