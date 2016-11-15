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
            if (Game.cpu.tickLimit - Game.cpu.getUsed() > 30) {
                if (s.type === action_types.MOVE_TO) {
                    const squad = [];
                    for (let creepName in Game.creeps) {
                        if (Game.creeps[creepName].memory.squad === s.actor) {
                            Game.creeps[creepName].moveTo(
                                new RoomPosition(s.payload.pos.x, s.payload.pos.y, s.payload.pos.roomName));
                        }
                    }

                } else if (s.type === action_types.ATTACK) {
                    const squad = [];
                    for (let creepName in Game.creeps) {
                        if (Game.creeps[creepName].memory.squad === s.actor) {
                            const pos = new RoomPosition(s.payload.pos.x, s.payload.pos.y, s.payload.pos.roomName);
                            const objs = Game.creeps[creepName].room.lookAt(pos);
                            const targets = _.filter(objs, o => o.type === 'creep' || o.type === 'structure');
                            if (targets.length) {
                                if (Game.creeps[creepName].attack(targets[0]) === ERR_NOT_IN_RANGE) {
                                    Game.creeps[creepName].moveTo(targets[0]);
                                }
                            }
                        }
                    }

                } else if (s.type === action_types.RETREAT) {
                    const squad = [];
                    for (let creepName in Game.creeps) {
                        if (Game.creeps[creepName].memory.squad === s.actor) {
                            const spawn = Game.spawns[0];
                            if (typeof spawn !== 'undefined') {
                                Game.creeps[creepName].moveTo(spawn);
                            }
                        }
                    }

                } else {
                    console.log(`Cannot perform unsupported action: ${s.type}`);
                }
            } else {
                console.log('ERR: CPU is too low to perform squad operations.');
            }
        });
    };

    return obj;

})();

module.exports = actionInitializer;
