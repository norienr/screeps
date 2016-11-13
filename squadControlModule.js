const storeProvider = require('./storeProvider');
const {action_types, actors, reducer} = require('./storeProviderConfig');

let squadControlModule = (function () {

    const initialState = {
        strategies: []
    };

    const o = {
        controlReducer: function (state = initialState, action) {
            if (!action_types.hasOwnProperty(action.type)) {
                return state;
            }

            return {
                strategies: [...state.strategies, {type: action.type, actor: action.actor}]
            };
        },
        setReducer: function (f) {
            Memory[reducer] = f;
        }

    };


    return {
        run: function () {
            o.setReducer(o.controlReducer);
            if (!storeProvider.storeIsInitialized()) {
                storeProvider.createStore();
            } else {
                console.log('STORE: ' + JSON.stringify(storeProvider.getState()));
                if (storeProvider.getState().strategies.length === 0) {
                    storeProvider.dispatch({
                        type: action_types.MOVE_TO,
                        actor: actors.SQUAD,
                        payload: {pos: new RoomPosition(15, 15, 'sim')}
                    });
                }

            }


        }
    };

})();

module.exports = squadControlModule;
