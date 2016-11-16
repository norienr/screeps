const {action_types} = require('./storeProviderConfig');
const Config = require('./config');

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
                        const pos = new RoomPosition(s.payload.pos.x, s.payload.pos.y, s.payload.pos.roomName);
                        let objs = pos.lookFor(LOOK_CREEPS);
                        if (objs.length === 0) {
                            objs = pos.lookFor(LOOK_STRUCTURES);
                        }
                        if (objs.length) {
                            const creepsAlive = [];
                            for (let creepName in Game.creeps) {
                                if (Game.creeps[creepName].memory.squad === s.actor) {
                                    const creep = Game.creeps[creepName];
                                    if (creep.memory.role === Config.ROLE_MELEE) {
                                        if (creep.attack(objs[0]) === ERR_NOT_IN_RANGE) {
                                            creep.moveTo(objs[0]);
                                        }
                                        creepsAlive.push(creepName);
                                    } else if (creep.memory.role === Config.ROLE_ARCHER) {
                                        if (creep.rangedAttack(objs[0]) === ERR_NOT_IN_RANGE) {
                                            creep.moveTo(objs[0]);
                                        }
                                        creepsAlive.push(creepName);
                                    } else if (creep.memory.role === Config.ROLE_HEALER) {
                                        if (creepsAlive.length) {
                                            creep.moveTo(creepsAlive[0]);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (s.type === action_types.RETREAT) {
                        const squad = [];
                        const spawn = Game.spawns[Object.keys(Game.spawns)[0]];
                        for (let creepName in Game.creeps) {
                            if (Game.creeps[creepName].memory.squad === s.actor) {
                                if (typeof spawn !== 'undefined') {
                                    Game.creeps[creepName].moveTo(spawn);
                                }
                            }
                        }

                    } else {
                        console.log(`Cannot perform unsupported action: ${s.type}`);
                    }
                }
                else {
                    console.log('ERR: CPU is too low to perform squad operations.');
                }
            }
        );
    }
    ;

    return obj;
})();

module.exports = actionInitializer;
