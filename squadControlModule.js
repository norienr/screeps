const storeProvider = require('./storeProvider');
const {action_types, reducer} = require('./storeProviderConfig');
const flagListener = require('./flagListener');
const actionInitializer = require('./actionInitializer');

let squadControlModule = (function () {

    const o = {
        initialState: [],
        controlReducer: function (state = this.initialState, action) {
            if (!action_types.hasOwnProperty(action.type)) {
                return state;
            }

            let res = [];

            for (let i = 0, len = state.length; i < len; ++i) {
                if (state[i].actor === action.actor) {
                    res = [...state];
                    res[i] = Object.assign({}, action);
                    return res;
                }
            }

            return [...state, Object.assign({}, action)];
        },
        setReducer: function (f) {
            if (typeof Memory[reducer] !== 'undefined') {
                return;
            }

            Memory[reducer] = f;
        }
    };

    return {
        run: function () {
            o.setReducer(o.controlReducer);
            if (!storeProvider.storeIsInitialized()) {
                storeProvider.createStore();
                return;
            }

            flagListener.init();
            flagListener.listen(storeProvider);
            actionInitializer.bind(storeProvider);


        }
    };

})();

module.exports = squadControlModule;
